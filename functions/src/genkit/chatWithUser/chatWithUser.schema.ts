import {z} from "genkit";
import {CREATOR_SCHEMA} from "../shared/schemas";

export const DISCUSSION_SCHEMA = z.object({
  author: CREATOR_SCHEMA,
  timestamp: z.number(),
  contents: z.string(),
});

export const FLOW_INPUT = z.object({
  path: z.string().min(1),
  discussion: DISCUSSION_SCHEMA,
  aiPersona: CREATOR_SCHEMA,
  context: z.string().optional(), // what is the purpose of context here? It might be for ux based discussions.
});

export const PROMPT_INPUT = z.object({
  history: z.array(
    z.object({
      author: z.string(),
      contents: z.string(),
    })
  ),
  currentMessage: z.string(),
  aiPersonaName: z.string(),
  context: z.string().optional(),
});
