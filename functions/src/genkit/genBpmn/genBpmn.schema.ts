import { z } from "genkit";
import { CREATOR_SCHEMA } from "../shared/schemas";

export const FLOW_INPUT = z.object({
  flowId: z.string(),
  topicId: z.string(),
  path: z.string(), // Firestore path to topic
  creator: CREATOR_SCHEMA,
});

export const PROMPT_INPUT = z.object({
  fullText: z.string().max(7000),
});

export const PROMPT_OUTPUT = z.object({
  bpmn: z.string(),
});

export const FLOW_OUTPUT = z.object({
  fileName: z.string(),
  filePath: z.string(),
});
