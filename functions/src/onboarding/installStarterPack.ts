import { HttpsError, onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { db } from "../shared/firebase";

export const installStarterPack = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { companyId, packName } = request.data;
  if (!companyId || !packName) {
    throw new HttpsError(
      "invalid-argument",
      "The function must be called with 'companyId' and 'packName' arguments."
    );
  }

  const profileId = request.auth.uid;
  logger.info(
    `Installing starter pack '${packName}' for company ${companyId}`,
    { uid: profileId }
  );
  const starterPackPath = `system/starterPacks/${packName}`;
  const companyPath = `profiles/${profileId}/companies/${companyId}`;

  try {
    // We assume the starter pack has collections like 'playbooks', 'teams', etc.
    // We will copy the documents inside the 'template' document.
    const templateDocPath = `${starterPackPath}/template`;
    const templateDoc = await db.doc(templateDocPath).get();

    if (!templateDoc.exists) {
      throw new HttpsError("not-found", `Starter pack '${packName}' does not exist.`);
    }

    // Get subcollections of the template document and copy them
    const collections = await db.doc(templateDocPath).listCollections();
    for (const collection of collections) {
      const collectionId = collection.id;
      const sourceCollectionRef = db.collection(`${templateDocPath}/${collectionId}`);
      const destCollectionRef = db.collection(`${companyPath}/${collectionId}`);
      
      const snapshot = await sourceCollectionRef.get();
      if (snapshot.empty) {
        continue;
      }

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        const newDocRef = destCollectionRef.doc(doc.id);
        batch.set(newDocRef, doc.data());
      });
      await batch.commit();
      
      logger.info(`Copied collection '${collectionId}' to company ${companyId}.`);
    }

    logger.info(
      `Successfully installed starter pack '${packName}' for company ${companyId}.`
    );
    return { success: true };
  } catch (error) {
    logger.error(
      `Error installing starter pack '${packName}' for company ${companyId}:`,
      error
    );
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError(
      "internal",
      "An unexpected error occurred while installing the starter pack."
    );
  }
});
