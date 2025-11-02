import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import {CallableRequest} from "firebase-functions/v2/https";
import {MarketplaceInstall} from "../shared/interfaces";
import {InstallStatus} from "../shared/enums";

export async function uninstallMarketplaceItem(req: CallableRequest<any>) {
  const installedDoc = await admin.firestore().doc(req.data.path).get();
  if (!installedDoc.exists)
    throw new functions.https.HttpsError("not-found", "Install record not found");

  const uninstall = {status: InstallStatus.Uninstalled, uninstalledAt: Date.now()};
  const { relatedPaths } = installedDoc.data() as MarketplaceInstall;

  for (const path of relatedPaths) {
    const docRef = admin.firestore().doc(path);
    await docRef.update(uninstall);
  }
  await admin.firestore().doc(req.data.path).update(uninstall);

  return { success: true };
}
