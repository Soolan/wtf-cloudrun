import {z} from "genkit";
import {VERTEX_AI} from "../shared/ai";
import {FLOW_INPUT, FLOW_OUTPUT, PROMPT_INPUT, PROMPT_OUTPUT} from "./genTopic.schema";
import {EXECUTABLE_PROMPT, FLOW_CONFIG} from "./genTopic.config";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {getUsage, saveTx} from "../shared/utils";
import {Currency, FlowStatus} from '../../shared/enums';

// Infer types from zod schemas
type FlowInput = z.infer<typeof FLOW_INPUT>;
type FlowOutput = z.infer<typeof FLOW_OUTPUT>;
type PromptInput = z.infer<typeof PROMPT_INPUT>;
type PromptOutput = z.infer<typeof PROMPT_OUTPUT>;

export const genTopicFlow = VERTEX_AI.defineFlow(
  FLOW_CONFIG,
  async (input: FlowInput): Promise<FlowOutput> => {
    console.log('You see me right?');
    console.log(input);
    const db = getFirestore();
    const startTime = Date.now() || 0;

    try {
      const {flowId, path, ...promptInput} = input;
      const flowRef = db.collection('flows').doc(flowId);
      await flowRef.update({progress: 30, messages: FieldValue.arrayUnion('Generating topic...')});

      // Step 1: Call AI Prompt
      const topic: PromptOutput = await prompt(path, promptInput);
      await flowRef.update({progress: 55, messages: FieldValue.arrayUnion('Recording usage...')});
      await flowRef.update({progress: 90, messages: FieldValue.arrayUnion('Saving topic...')});

      // Step 2: Add to Firestore
      const result = await add(path, topic);

      // Step 3: Finalize Flow
      await flowRef.update({
        status: FlowStatus.Completed,
        progress: 100,
        messages: FieldValue.arrayUnion(`Topic added successfully.`),
        duration_ms: Date.now() - startTime,
        result: result,
      });
      return {flowId: flowRef.id};
    } catch (error: any) {
      console.error(`CRITICAL ERROR in genTopicFlow.`, error);

      // Always update Firestore so UI isn't stuck on "Initializing..."
      if (input?.flowId) {
        const flowRef = db.collection("flows").doc(input.flowId);
        await flowRef.update({
          status: FlowStatus.Error,
          messages: FieldValue.arrayUnion("Connection failed. Please try again in a few seconds."),
          error: error.message?.slice(0, 500) ?? "Unknown error",
          duration_ms: Date.now() - startTime
        });
      }
      // Throw a friendly message for the client
      throw new Error("Connection failed. Please try again in a few seconds.");
    }
  }
);

async function prompt(path: string, promptInput: PromptInput): Promise<PromptOutput> {
  const rawResponse = await EXECUTABLE_PROMPT(promptInput);
  const content = rawResponse.text;
  const usage = getUsage(rawResponse?.usage);
  const balance = {currency: Currency.AI, amount: usage}
  const parsed = JSON.parse(content);
  const memoAI = `[Topic] ${parsed.title.slice(0, 25)} ...`;
  await saveTx(path, balance, memoAI);
  try {
    return PROMPT_OUTPUT.parse(parsed); // Extra safety: validate against zod schema
  } catch (err) {
    throw new Error("Failed to parse model output: " + err);
  }
}

async function add(path: string, topic: PromptOutput): Promise<{ docId: string; success: boolean; }> {
  try {
    const db = getFirestore();
    const docRef = await db.collection(path).add(topic);
    return {docId: docRef.id, success: !!docRef.id};
  } catch (error: any) {
    console.error("Error in add:", error);
    throw new Error(`Error saving topic: ${error.message}`);
  }
}
