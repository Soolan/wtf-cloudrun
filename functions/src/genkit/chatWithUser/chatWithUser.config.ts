import {PromptConfig} from "genkit";
import {z} from "genkit";
import {FLOW_INPUT, PROMPT_INPUT} from "./chatWithUser.schema";
import {VERTEX_AI} from '../shared/ai';

export const FLOW_CONFIG = {
  name: "chatWithUserFlow",
  inputSchema: FLOW_INPUT,
  outputSchema: z.void(),
};

export const PROMPT_CONFIG: PromptConfig = {
  name: "chatWithUserPrompt",
  input: { schema: PROMPT_INPUT },
  output: { schema: z.string() },
  model: "vertexai/gemini-1.5-flash",
  config: { temperature: 0.7 },
};

export const EXECUTABLE_PROMPT: any = VERTEX_AI.definePrompt(
  PROMPT_CONFIG,
  `
You are {{aiPersonaName}}, a helpful AI assistant embedded within a project management tool.
{{#if context}}
Here is the context for the current discussion:
---
{{context}}
---
{{/if}}
Your role is to assist users by answering their questions and continuing the conversation based on the provided history.
Keep your responses concise and helpful.

Conversation History:
{{#each history}}
- {{author}}: {{contents}}
{{/each}}

Current Message:
- User: {{currentMessage}}

Your Response:
`
);
