import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import {cloneDocWithSubcollections} from "./cloneDocWithSubcollections";
import {CallableRequest} from "firebase-functions/v2/https";
import {InstallStatus, MarketplaceItemType} from "../shared/enums";
import {InstallRequest, MarketplaceItem} from "../shared/interfaces";

export async function installMarketplaceItem(req: CallableRequest<InstallRequest>) {
  const { itemId, path, installedBy } = req.data;
  const sourcePath = `marketplace-items/${itemId}`;
  const sourceDoc = await admin.firestore().doc(sourcePath).get();
  if (!sourceDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Marketplace item not found");
  }
  const item = sourceDoc.data() as MarketplaceItem;
  const type = item?.type as MarketplaceItemType;

  const relatedPaths = await cloneDocWithSubcollections(
    `${sourcePath}/${type}`,
    `${path}/${type}`
  );

  await admin.firestore()
    .doc(`${path}/marketplace-installs/${itemId}`)
    .set({
      installedAt: Date.now(),
      installedBy,
      status: InstallStatus.Installed,
      relatedPaths
    });

  return { success: true };
}
