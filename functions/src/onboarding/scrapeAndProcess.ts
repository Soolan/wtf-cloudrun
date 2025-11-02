import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as http from "http";

// TODO: Move to a shared constants file and use Firebase secrets
const NVIDIA_API_BASE = process.env.NVIDIA_API_BASE;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_API_PATH = "/v1/chat/completions"; // OpenAI compatible chat completions endpoint

export const scrapeAndProcess = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const {url, companyId} = request.data;
  if (!url || !companyId) {
    throw new HttpsError("invalid-argument", "The function must be called with 'url' and 'companyId' arguments.");
  }

  const profileId = request.auth.uid;

  if (!NVIDIA_API_BASE || !NVIDIA_API_KEY) {
    logger.error("NVIDIA API environment variables are not set.");
    throw new HttpsError("internal", "AI service is not configured.");
  }

  logger.info(`Scraping and processing URL: ${url} for company ${companyId}`, {uid: profileId});

  const postData = JSON.stringify({
    model: "meta-llama/llama-3.1-8b-instruct",
    messages: [
      {role: "system", content: "You are a helpful assistant that scrapes and processes information from URLs."},
      {
        role: "user",
        content: `Scrape and summarize the content from the following URL: ${url}. Extract key information relevant to a company with ID ${companyId}.`
      }
    ],
    max_tokens: 2048,
    temperature: 0.5
  });

  const [hostname, port] = NVIDIA_API_BASE.split(':');

  const options = {
    hostname: hostname,
    port: parseInt(port, 10),
    path: NVIDIA_API_PATH,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
    },
  };

  // This endpoint is asynchronous, so we don't wait for the full processing.
  // We just need to ensure the request was successfully received.
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const responseJson = JSON.parse(data);
            const generatedContent = responseJson.choices[0].message.content;
            logger.info(`Successfully processed URL: ${url}`, {uid: profileId});
            resolve({success: true, message: "Processing started.", content: generatedContent});
          } catch (error) {
            logger.error("Error parsing NVIDIA API response:", error);
            reject(new HttpsError("internal", "Failed to parse response from AI service."));
          }
        } else {
          req.on("error", (error) => {
            logger.error("Error calling NVIDIA API:", error);
            reject(new HttpsError("internal", "An error occurred while calling the AI service."));
          });

          req.write(postData);
          req.end();
        }
      });
    });
  });
});
