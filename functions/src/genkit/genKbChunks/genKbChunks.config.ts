import { FlowConfig } from "genkit";
import { FLOW_INPUT, FLOW_OUTPUT } from "./genKbChunks.schema";

export const FLOW_CONFIG: FlowConfig = {
  name: "generateKbChunksFlow",
  inputSchema: FLOW_INPUT,
  outputSchema: FLOW_OUTPUT,
};
