import {getFirestore} from "firebase-admin/firestore";
import {PROFILES} from "../shared/constants/profiles";
import {logger} from "firebase-functions";
import {Profile} from "../shared/interfaces/profile";
import {getApps, initializeApp} from 'firebase-admin/app';

export async function getTagByUid(id: string) {
  // ✅ Initialize *locally* if not yet initialized
  if (!getApps().length) {
    initializeApp();
  }

  const db = getFirestore();
  try {
    const snap = await db.collection(PROFILES.path).doc(id).get();
    const profile = snap.data() as Profile;
    return profile.tag;
  } catch (err) {
    logger.error(`Failed fetching profile ${id}:`, err);
    return null;
  }
}
