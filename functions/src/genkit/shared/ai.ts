import {Genkit, genkit} from "genkit";
import {vertexAI} from "@genkit-ai/vertexai";
import "dotenv/config";
import {enableFirebaseTelemetry} from "@genkit-ai/firebase";
// import {googleAI} from "@genkit-ai/googleai";
// import {GEMINI_API_KEY} from "./config";

export const VERTEX_AI: Genkit = genkit({
  plugins: [
    vertexAI({
      location: "us-central1",
      projectId: process.env["GCLOUD_PROJECT"], // "wtf-workspace-ad6a4",
    }),
  ],
});

enableFirebaseTelemetry().then(() => console.log("Telemetry enabled"));
