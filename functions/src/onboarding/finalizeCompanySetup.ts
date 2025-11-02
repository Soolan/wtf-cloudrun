import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface TeamNode {
  jobTitle: string;
  name: string;
  children?: TeamNode[];
}

interface FinalizeCompanySetupData {
  companyName: string;
  industry: string;
  teamStructure: TeamNode[];
  logoUrl: string | null;
  bannerUrl: string | null;
  knowledgeOption: 'file' | 'link' | 'starter-pack' | null;
  knowledgeFileName?: string;
  knowledgeUrl?: string;
}

export const finalizeCompanySetup = functions.https.onCall(async (data: FinalizeCompanySetupData, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const userId = context.auth.uid;
  const { companyName, industry, teamStructure, logoUrl, bannerUrl, knowledgeOption, knowledgeFileName, knowledgeUrl } = data;

  if (!companyName || !industry) {
    throw new functions.https.HttpsError('invalid-argument', 'Company name and industry are required.');
  }

  try {
    const db = admin.firestore();

    // Create a new company document
    const companyRef = db.collection(`profiles/${userId}/companies`).doc();
    const companyId = companyRef.id;

    const companyData: any = {
      name: companyName,
      industry: industry,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      ownerId: userId,
      // Add other fields as necessary
    };

    if (logoUrl) {
      companyData.logoUrl = logoUrl;
    }
    if (bannerUrl) {
      companyData.bannerUrl = bannerUrl;
    }

    // Save company data
    await companyRef.set(companyData);

    // Save team structure if provided
    if (teamStructure && teamStructure.length > 0) {
      // For simplicity, storing as a field. For complex structures, a subcollection might be better.
      await companyRef.update({ teamStructure: teamStructure });
    }

    // Record knowledge ingestion details
    if (knowledgeOption) {
      const knowledgeDetails: any = { option: knowledgeOption };
      if (knowledgeOption === 'file' && knowledgeFileName) {
        knowledgeDetails.fileName = knowledgeFileName;
        // Further processing for file might be triggered by GCS function
      } else if (knowledgeOption === 'link' && knowledgeUrl) {
        knowledgeDetails.url = knowledgeUrl;
        // Further processing for URL might be triggered by scrapeAndProcess function
      } else if (knowledgeOption === 'starter-pack') {
        // Starter pack installation is handled by another function, just record the choice
      }
      await companyRef.update({ knowledgeDetails: knowledgeDetails });
    }

    return { companyId: companyId, message: 'Company setup finalized successfully.' };
  } catch (error) {
    console.error('Error finalizing company setup:', error);
    throw new functions.https.HttpsError('internal', 'Failed to finalize company setup.', error);
  }
});
