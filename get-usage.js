// get-usage.js
import {initializeApp, cert} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

// --- Configuration ---
// The script will attempt to use your Application Default Credentials.
// If that fails, you can uncomment the following line and point it to your service account key.
// const serviceAccount = require('/path/to/your/serviceAccountKey.json');

async function getGeminiUsage() {
  console.log('Initializing Firebase Admin SDK...');
  try {
    initializeApp({
      // credential: cert(serviceAccount) // Uncomment if using a service account file
    });
  } catch (e) {
    // This is expected if the app is already initialized (e.g., by another process)
    if (e.code !== 'app/duplicate-app') {
      console.error('Firebase initialization error:', e);
      return;
    }
  }

  const db = getFirestore();
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const threeDaysAgoTimestamp = threeDaysAgo.getTime();

  let totalTokens = 0;
  let transactionCount = 0;

  console.log('Fetching profiles...');
  const profilesSnapshot = await db.collection('profiles').get();

  if (profilesSnapshot.empty) {
    console.log('No profiles found.');
    return;
  }

  console.log(`Found ${profilesSnapshot.size} profile(s). Querying transactions...`);

  for (const profileDoc of profilesSnapshot.docs) {
    const transactionsSnapshot = await db.collection('profiles').doc(profileDoc.id).collection('transactions')
      .where('timestamp', '>=', threeDaysAgoTimestamp)
      .where('type', '==', 'AiUsage')
      .get();

    if (!transactionsSnapshot.empty) {
      transactionsSnapshot.forEach(txDoc => {
        const tx = txDoc.data();
        // Amount is stored as a negative number, so we make it positive for summation
        totalTokens += Math.abs(tx.balance.amount);
        transactionCount++;
      });
    }
  }

  console.log('\n--- Gemini Usage Report (Last 3 Days) ---');
  console.log(`Total AI Transactions: ${transactionCount}`);
  console.log(`Total Tokens Used: ${totalTokens}`);
  console.log('-------------------------------------------');
  console.log('\nTo estimate costs, please refer to the official Google Cloud Vertex AI pricing page.');
  console.log('Note: This script only calculates usage recorded by the saveTx utility function.');
}

getGeminiUsage().catch(error => {
  console.error('An error occurred:', error);
});
