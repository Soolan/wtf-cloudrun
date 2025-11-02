import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import {db, storage} from '../shared/firebase';

interface RestoreRequest {
  profileId: string;
  companyId: string;
  backupPath: string; // profiles/{profileId}/backups/{2025-07-17T12:00:00Z}
}

// ToDo: Add a logic for loading backups from files.
export async function restore(req: CallableRequest<RestoreRequest>) {
  const { profileId, companyId, backupPath } = req.data;

  if (!req.auth) {
    throw new HttpsError('unauthenticated', 'Login required');
  }

  const metadataFile = storage.bucket().file(`${backupPath}/backup_metadata.json`);
  const [metaContents] = await metadataFile.download();
  const metadata = JSON.parse(metaContents.toString());
  console.log(`Restoring backup from: ${metadata.timestamp} (v${metadata.version})`);

  const targetBasePath = `profiles/${profileId}/companies/${companyId}`;

  // Get all folders inside the backup
  const [files] = await storage.bucket().getFiles({ prefix: `${backupPath}/` });
  const collectionPaths = new Set<string>();

  for (const file of files) {
    const relative = file.name.replace(`${backupPath}/`, '');
    const pathParts = relative.split('/');
    if (pathParts.length > 1) {
      const collectionKey = pathParts.slice(0, -1).join('/');
      collectionPaths.add(collectionKey);
    }
  }

  const sortedPaths = [...collectionPaths].sort((a, b) => a.localeCompare(b));

  for (const collectionPath of sortedPaths) {
    await restoreCollection(targetBasePath, collectionPath, backupPath);
  }

  return {
    success: true,
    restoredCollections: sortedPaths.length,
  };
}

async function restoreCollection(
  targetBasePath: string,
  collectionPath: string,
  storagePrefix: string
) {
  const collectionFullPath = `${storagePrefix}/${collectionPath}`;
  const [files] = await storage.bucket().getFiles({ prefix: collectionFullPath });

  const chunkFiles = files
    .filter(file => file.name.endsWith('.json') && file.name.includes('output-'))
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const file of chunkFiles) {
    const [contents] = await file.download();
    const docs = JSON.parse(contents.toString()) as any[];

    for (const doc of docs) {
      const { id, ...data } = doc;
      const targetPath = `${targetBasePath}/${collectionPath}/${id}`;
      await db.doc(targetPath).set(data, { merge: true });
    }
  }

  console.log(`[✅] Restored: ${collectionPath} (${chunkFiles.length} chunks)`);
}
