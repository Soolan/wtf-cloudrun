import {onObjectFinalized} from "firebase-functions/v2/storage";
import * as logger from "firebase-functions/logger";
import * as https from "https";
import { storage } from "../shared/firebase";

// TODO: Move to a shared constants file and use Firebase secrets
const NVIDIA_API_BASE = process.env.NVIDIA_API_BASE;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_API_PATH = "/process_document"; // as per documentation

export const processKnowledgeFile = onObjectFinalized({cpu: 2}, async (event) => {
  const fileBucket = event.data.bucket;
  const filePath = event.data.name;
  const contentType = event.data.contentType;

  // Exit if this is triggered on a file that is not in a knowledge directory.
  if (!filePath.includes("/knowledge/")) {
    logger.log(`File ${filePath} is not a knowledge file, skipping.`);
    return;
  }

  // Exit if the file is not a supported type (e.g. PDF, DOCX, etc.)
  // This is a placeholder for actual content type validation
  if (!contentType?.startsWith("application/")) {
    logger.log(`File ${filePath} has unsupported content type ${contentType}, skipping.`);
    return;
  }

  // Extract profileId and companyId from the file path
  // Path format: profiles/{profileId}/companies/{companyId}/knowledge/{fileName}
  const pathParts = filePath.split("/");
  if (pathParts.length < 5) {
    logger.error(`Invalid file path structure: ${filePath}`);
    return;
  }
  const profileId = pathParts[1];
  const companyId = pathParts[3];

  logger.info(`Processing knowledge file: ${filePath} for company ${companyId}`);

  if (!NVIDIA_API_BASE || !NVIDIA_API_KEY) {
    logger.error("NVIDIA API environment variables are not set.");
    // We can't throw an HttpsError here, so we just log and exit.
    return;
  }

  // Get a signed URL for the file to pass to the NVIDIA endpoint
  const bucket = storage.bucket(fileBucket);
  const file = bucket.file(filePath);
  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60, // 1 hour
  });

  const postData = JSON.stringify({
    file_url: signedUrl,
    company_id: companyId,
    profile_id: profileId,
  });

  const options = {
    hostname: NVIDIA_API_BASE,
    path: NVIDIA_API_PATH,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
    },
  };

  // This is an async call to an external service.
  const req = https.request(options, (res) => {
    if (res.statusCode !== 202) { // Accepted
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        logger.error(`NVIDIA API request failed with status ${res.statusCode}:`, data);
      });
    } else {
      logger.info(`Successfully submitted file for processing: ${filePath}`);
    }
  });

  req.on("error", (error) => {
    logger.error("Error calling NVIDIA API:", error);
  });

  req.write(postData);
  req.end();
});
