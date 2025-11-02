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
  score: z.number().min(0).max(10),
  hasParticipants: z.boolean(),
  hasActivities: z.boolean(),
  hasDecisions: z.boolean(),
  hasSequence: z.boolean(),
  hasArtifacts: z.boolean(),
  recommendations: z.array(z.string()),
});

export const FLOW_OUTPUT = z.object({
  assessment: PROMPT_OUTPUT,
});
