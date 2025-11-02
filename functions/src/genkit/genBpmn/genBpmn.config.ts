import { PromptConfig } from "genkit";
import { FLOW_INPUT, FLOW_OUTPUT, PROMPT_INPUT } from "./genBpmn.schema";
import { VERTEX_AI } from "../shared/ai";

export const FLOW_CONFIG = {
  name: "genBpmnFlow",
  inputSchema: FLOW_INPUT,
  outputSchema: FLOW_OUTPUT,
};

export const PROMPT_CONFIG: PromptConfig = {
  name: "generateBpmn",
  input: { schema: PROMPT_INPUT },
  model: "vertexai/gemini-1.5-flash",
  config: { temperature: 0.1 }, // Low temp for precision
};

export const EXECUTABLE_PROMPT: any = VERTEX_AI.definePrompt(
  PROMPT_CONFIG,
  `
You are a business process analyst.
Your task is to read the provided text and extract all process steps, participants, and flows, and format
them as a simple JSON graph.

**CRITICAL INSTRUCTION: You MUST base your analysis and the resulting JSON graph STRICTLY and ONLY
on the user-provided text. Do NOT invent a process or use generic examples like pizza orders.
The output must be a direct representation of the provided text.**

Instructions:
1.  **Identify Participants:** Create a participant for each major role or system (e.g., "Customer", "Warehouse").
2.  **Identify Nodes:** For each participant, list all the tasks, events, and gateways they perform. Assign a unique 'id' and a clear 'label' for each node.
3.  **Identify Edges (Flows):** Create an edge for every flow connecting two nodes.
    - If the flow is between nodes belonging to the *same* participant, set 'type': 'sequence'.
    - If the flow is between nodes belonging to *different* participants, set 'type': 'message'.
    - 'source' and 'target' must match the 'id' of the nodes they connect.

Return ONLY JSON in this schema:
{
  "participants": [
    {
      "name": "Participant A",
      "nodes": [
        { "id": "node_A1", "type": "startEvent", "label": "Start A" },
        { "id": "node_A2", "type": "task", "label": "Task A" }
      ]
    }
  ],
  "edges": [
    { "id": "edge_1", "source": "node_A1", "target": "node_A2", "type": "sequence", "label": "" }
  ]
}
`
);
