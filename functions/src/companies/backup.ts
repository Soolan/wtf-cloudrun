import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import {db, storage} from '../shared/firebase';

// This function will backup the collections inside the storage using the following structure
// profiles/{profileId}/backups/{timestamp}/
// ├── backup_metadata.json
// ├── team/
// │   ├── export_metadata.json
// │   ├── output-0.json
// ├── tickets/
// │   ├── export_metadata.json
// │   ├── output-0.json
// │   └── ticket-abc/discussions/
// │       ├── export_metadata.json
// │       ├── output-0.json
// ├── playbook/
// │   ├── export_metadata.json
// │   ├── output-0.json


interface BackupRequest {
  profileId: string;
  companyId: string;
}

const maxChunkSize = 100; // 100 docs per chunk. each chunk will be stored as an output-1.json file later

export async function backup(req: CallableRequest<BackupRequest>) {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Login required');

  try {
    const {profileId, companyId} = req.data;
    const timestamp = new Date().toISOString();
    const baseFirestorePath = `profiles/${profileId}/companies/${companyId}`;
    const baseStoragePath = `profiles/${profileId}/backups/${timestamp}`;

    // We'll fetch all first-level sub collections under the company path
    const companyDocRef = db.doc(baseFirestorePath);
    const subCollections = await companyDocRef.listCollections();

    const backupMetadata = {
      version: 1,
      timestamp,
      profileId,
      originalCompanyId: companyId,
      collections: subCollections.map(col => col.id),
    };

    // Backup each top-level collection (recursively)
    for (const col of subCollections) {
      await backupCollection(`${baseFirestorePath}/${col.id}`, baseStoragePath, [col.id]);
    }

    // Upload top-level metadata
    const metadataFile = storage.bucket("wtf-workspace-ad6a4.appspot.com").file(`${baseStoragePath}/backup_metadata.json`);
    await metadataFile.save(JSON.stringify(backupMetadata, null, 2), {contentType: 'application/json'});
    await metadataFile.makePublic();
    return {
      success: true,
      message: 'Backup completed successfully.',
      downloadUrl: metadataFile.publicUrl(),
    };

  } catch (error: any) {
    console.error('Backup error:', error);

    throw new HttpsError(
      'internal',
      'An error occurred during backup',
      { message: error?.message || 'Unknown error' }
    );
  }
}

// Recursively backup a Firestore collection and all nested sub collections.
async function backupCollection(firestorePrefix: string, storagePrefix: string, collectionPath: string[] = []) {
  const snapshot = await db.collection(firestorePrefix).get();
  const docs = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const collectionKey = collectionPath.join('/');
  const chunks: any[][] = [];

  for (let i = 0; i < docs.length; i += maxChunkSize) {
    // it pushes an array of docs into chunks array. Assuming we have 320 docs:
    //   chunks = [
    //     [ doc1,   ..., doc100 ],       // chunk 0
    //     [ doc101, ..., doc200 ],       // chunk 1
    //     [ doc201, ..., doc300 ],       // chunk 2
    //     [ doc301, ..., doc320 ],       // chunk 3
    //   ];
    chunks.push(docs.slice(i, i + maxChunkSize));
  }

  for (let i = 0; i < chunks.length; i++) {
    const filePath = `${storagePrefix}/${collectionKey}/output-${i}.json`;
    await storage.bucket().file(filePath).save(JSON.stringify(chunks[i], null, 2), {
      contentType: 'application/json',
    });
  }

  // Metadata file for the collection
  const metadata = {
    collection: collectionKey,
    documentCount: docs.length,
    chunks: chunks.length,
  };
  await storage.bucket()
    .file(`${storagePrefix}/${collectionKey}/export_metadata.json`)
    .save(JSON.stringify(metadata, null, 2), {
      contentType: 'application/json',
    });

  // Progress notification
  console.log(`[✅] Backed up: ${collectionKey} (${docs.length} docs)`);

  // Recurse into subCollections
  for (const docSnap of snapshot.docs) {
    const subCollections = await docSnap.ref.listCollections();
    for (const sub of subCollections) {
      await backupCollection(
        `${firestorePrefix}/${docSnap.id}/${sub.id}`,
        storagePrefix,
        [...collectionPath, docSnap.id, sub.id]
      );
    }
  }
}
