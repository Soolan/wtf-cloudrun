import * as admin from "firebase-admin";

const firestore = admin.firestore();

export async function cloneDocWithSubcollections(
  sourceDocPath: string,
  targetDocPath: string,
  batchSize: number = 500
): Promise<string[]> {
  const relatedPaths: string[] = [];

  const sourceDocSnap = await firestore.doc(sourceDocPath).get();
  const data = sourceDocSnap.data();
  if (data) {
    await firestore.doc(targetDocPath).set({
      ...data,
      timestamps: { createdAt: Date.now() }
    });
  }
  relatedPaths.push(targetDocPath);

  const subcollections = await firestore.doc(sourceDocPath).listCollections();
  for (const subcol of subcollections) {
    const subcolPath = `${targetDocPath}/${subcol.id}`;
    const query = subcol.limit(batchSize);
    let snapshot = await query.get();

    while (!snapshot.empty) {
      const batch = firestore.batch();

      snapshot.docs.forEach((doc) => {
        const targetSubDoc = firestore.doc(`${subcolPath}/${firestore.collection(subcolPath).doc().id}`);
        batch.set(targetSubDoc, doc.data());
        relatedPaths.push(targetSubDoc.path);
      });

      await batch.commit();

      const last = snapshot.docs[snapshot.docs.length - 1];
      snapshot = await subcol.startAfter(last).limit(batchSize).get();
    }
  }

  return relatedPaths;
}
