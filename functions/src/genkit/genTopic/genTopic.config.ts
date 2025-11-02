import {PromptConfig} from "genkit";
import {FLOW_INPUT, FLOW_OUTPUT, PROMPT_INPUT, PROMPT_OUTPUT} from "./genTopic.schema";
import {VERTEX_AI} from '../shared/ai';

export const FLOW_CONFIG = {
  name: "generateTopicFlow",
  inputSchema: FLOW_INPUT,
  outputSchema: FLOW_OUTPUT,
};

export const PROMPT_CONFIG: PromptConfig = {
  name: "analyzeContent",
  input: { schema: PROMPT_INPUT },
  output: { schema: PROMPT_OUTPUT },
  model: "vertexai/gemini-1.5-flash",
  config: { temperature: 0.4 },
};

export const EXECUTABLE_PROMPT: any = VERTEX_AI.definePrompt(
  PROMPT_CONFIG,
  `
You are a content analyst helping build a company's playbook manual.

Context:
- Content Type: {{mimeType}}
- Source Type: {{sourceType}}
{{#if url}}- URL: {{url}}{{/if}}
{{#if file}}- Base64 File Provided{{/if}}

Creator Info:
- ID: {{creator.id}}
- Name: {{creator.name}}
- Avatar: {{creator.avatar}}

Instructions:
Analyze the source content (which could be a webpage, document, or video) and generate a topic object in JSON format matching the following schema:

{
  "title": "string (max 50 chars)",
  "subtitle": "string (max 200 chars)",
  "fullText": "string (max 7000 chars)",
  "order": {{order}},
  "status": "draft",
  "creator": {
    "id": "{{creator.id}}",
    "name": "{{creator.name}}",
    "avatar": "{{creator.avatar}}"
  },
  "parentId": "{{parentId}}",
  "tags": ["tag1", "tag2", "tag3"],
  "timestamps": {
    "createdAt": "<current ISO timestamp>",
    "updatedAt": "<same as createdAt>",
    "deletedAt": 0
  }
}

Important:
- Focus only on the **main content** that is informative, instructional, or meaningful to a business manual.
- **Ignore any advertisements, sponsored messages, intros, outros, or promotional content** (especially in videos).
- If analyzing a video or a webpage, begin from the point where the actual subject matter starts — not from commercial segments.
- Use your best judgment to skip irrelevant content even if it appears early in the source.

Notes:
- Avoid repeating title in subtitle.
- Be concise but meaningful.
- The content should provide helpful information for employees or step by step guide for delivering a task.
- Tags should be 3 to 5 relevant terms or phrases.
- If content lacks structure, do your best to extract useful information.
- Return only the JSON object — no explanations.
`
);
