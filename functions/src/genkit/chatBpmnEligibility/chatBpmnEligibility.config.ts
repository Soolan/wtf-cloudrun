import { PromptConfig } from "genkit";
import { FLOW_INPUT, FLOW_OUTPUT, PROMPT_INPUT, PROMPT_OUTPUT } from "./chatBpmnEligibility.schema";
import { VERTEX_AI } from "../shared/ai";

export const FLOW_CONFIG = {
  name: "chatBpmnEligibilityFlow",
  inputSchema: FLOW_INPUT,
  outputSchema: FLOW_OUTPUT,
};

export const PROMPT_CONFIG: PromptConfig = {
  name: "assessBpmnEligibility",
  input: { schema: PROMPT_INPUT },
  output: { schema: PROMPT_OUTPUT },
  model: "vertexai/gemini-1.5-flash",
  config: { temperature: 0.2 }, // keep it analytical
};

export const EXECUTABLE_PROMPT: any = VERTEX_AI.definePrompt(
  PROMPT_CONFIG,
  `
You are a business process analyst. Your task is to assess if the given text is suitable for conversion into a BPMN 2.0 diagram.

Instructions:
- Examine the text to identify core business process elements.
- For each element, provide a boolean value and a brief justification or example from the text.
- Provide a numeric score (0–10) reflecting the overall suitability for BPMN conversion.
- Provide clear, actionable recommendations for improvement if details are missing or unclear.

Return ONLY JSON in this schema:
{
  "score": <0-10>,
  "hasParticipants": true/false,  // Are there distinct roles, people, or systems performing actions? (e.g., "Customer", "Warehouse System")
  "hasActivities": true/false,    // Are there specific actions being performed? (e.g., "places an order", "verifies product availability")
  "hasDecisions": true/false,       // Are there conditional branches where the flow changes? Look for "if", "whether", "either/or".
  "hasSequence": true/false,        // Is there a clear order of events from start to finish?
  "hasArtifacts": true/false,      // Are documents or data objects being created or used? (e.g., "shopping cart", "order confirmation")
  "recommendations": ["string", ...]
}
`
);
