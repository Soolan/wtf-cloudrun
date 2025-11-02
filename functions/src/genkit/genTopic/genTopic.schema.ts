import {z} from "genkit";
import {CREATOR_SCHEMA, TIMESTAMPS_SCHEMA} from "../shared/schemas";

export const FLOW_INPUT = z.object({
  flowId: z.string(),
  url: z.string().url("Invalid URL format").optional(),
  file: z.string().optional(), // base64-encoded
  mimeType: z.string(), // Required for downstream logic
  sourceType: z.enum(["url", "file", "transcript"]),
  creator: CREATOR_SCHEMA,
  order: z.number().min(0),
  parentId: z.string().optional(),
  path: z.string().min(1), // Firestore path like `topics/abc123/subtopics`
}).refine((data) => data.url || data.file, {
  message: "Either 'url' or 'file' must be provided.",
  path: ["url"],
});

export const PROMPT_INPUT = z.object({
  url: z.string().url("Invalid URL format").optional(),
  file: z.string().optional(), // base64-encoded
  mimeType: z.string(), // Required for downstream logic
  sourceType: z.enum(["url", "file", "transcript"]),
  creator: CREATOR_SCHEMA,
  order: z.number().min(0),
  parentId: z.string().optional(),
});

export const PROMPT_OUTPUT = z.object({
  title: z.string().max(50, "Title must be 50 characters or less"),
  subtitle: z.string().max(200, "Subtitle must be 200 characters or less"),
  fullText: z.string().max(7000, "Full text must be 7000 characters or less"),
  order: z.number().min(0, "Order must be 0 or greater"),
  status: z.string().default("Draft"),
  creator: CREATOR_SCHEMA,
  parentId: z.string().optional(),
  tags: z.array(z.string()).min(3).max(12).optional(), // tighter optional array validation
  timestamps: TIMESTAMPS_SCHEMA,
});

export const FLOW_OUTPUT = z.object({
  flowId: z.string(),
});



// ToDo:
// - The whole thing should be handled by Playbook maintainer:
//   - Upon hitting the generate-topic button, silently, pass her the company ID card
// (Who are they, What they do, their industry, vision, mission, values, slogan)
// - If topic to be generated under a section, she should fetch the section title and all the sibling titles to provide clarity and say:
//   "I see you want to add a new topic under the xxx section"
//   - Examine the provided contents against the company ID, section and siblings:
//   - If irrelevant: add a message on top of the topic and do your best to generate-topic the topic:
//   "This topic need your attention. It seems provided contents are irrelevant to what you do, or they lack clarity."
//   - else: generate-topic the topic using the provided info.
