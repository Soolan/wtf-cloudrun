import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as http from "http";

// TODO: Move to a shared constants file and use Firebase secrets
const NVIDIA_API_BASE = process.env.NVIDIA_API_BASE; // e.g., "api.nvcf.nvidia.com"
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_API_PATH = "/v1/chat/completions"; // OpenAI compatible chat completions endpoint

export const generateTeam = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const {industry} = request.data;
  if (!industry) {
    throw new HttpsError("invalid-argument", "The function must be called with an 'industry' argument.");
  }

  if (!NVIDIA_API_BASE || !NVIDIA_API_KEY) {
    logger.error("NVIDIA API environment variables are not set.");
    throw new HttpsError("internal", "AI service is not configured.");
  }

  logger.info(`Generating team structure for industry: ${industry}`, {uid: request.auth.uid});

  const postData = JSON.stringify({
    model: "meta-llama/llama-3.1-8b-instruct",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that generates team structures. " +
          "You MUST only respond with valid JSON. Do NOT include any conversational text or explanations. " +
          "The JSON should be an array of objects, where each object has 'jobTitle', 'name', and " +
          "optionally 'children' (an array of similar objects)."
      },
      {role: "user", content: `Generate a team structure for a company in the ${industry} industry.`}
    ],
    max_tokens: 1024,
    temperature: 0.7
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
            try {
              const teamData = JSON.parse(generatedContent);
              logger.info(`Successfully generated team structure for industry: ${industry}`, {uid: request.auth?.uid});
              resolve({team: teamData});
            } catch (jsonError) {
              logger.error(`Failed to parse generated content as JSON. Raw content: ${generatedContent}`, jsonError);
              reject(new HttpsError("internal", "AI model did not return valid JSON."));
            }
          } catch (error) {
            logger.error("Error parsing NVIDIA API response:", error);
            reject(new HttpsError("internal", "Failed to parse response from AI service."));
          }
        } else {
          logger.error(`NVIDIA API request failed with status ${res.statusCode}:`, data);
          reject(new HttpsError("internal", `Request to AI service failed with status ${res.statusCode}.`));
        }
      });
    });

    req.on("error", (error) => {
      logger.error("Error calling NVIDIA API:", error);
      reject(new HttpsError("internal", "An error occurred while calling the AI service."));
    });

    req.write(postData);
    req.end();
  });
});
