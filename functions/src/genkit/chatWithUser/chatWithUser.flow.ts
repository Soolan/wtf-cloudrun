import {z} from "genkit";
import {VERTEX_AI} from "../shared/ai";
import {FLOW_INPUT, PROMPT_INPUT, DISCUSSION_SCHEMA} from "./chatWithUser.schema";
import {EXECUTABLE_PROMPT, FLOW_CONFIG} from "./chatWithUser.config";
import {getFirestore} from "firebase-admin/firestore";
import {getUsage, saveTx} from "../shared/utils";
import {Currency} from '../../shared/enums';
import {Entity} from '../../shared/interfaces';

type FlowInput = z.infer<typeof FLOW_INPUT>;
type Discussion = z.infer<typeof DISCUSSION_SCHEMA>;
type PromptInput = z.infer<typeof PROMPT_INPUT>;

export const chatWithUserFlow = VERTEX_AI.defineFlow(
  FLOW_CONFIG,
  async (input: FlowInput): Promise<void> => {
    const db = getFirestore();
    const { path, discussion, aiPersona, context } = input;

    try {
      // 1. Fetch chat history from Firestore
      const historySnapshot = await db.collection(path).orderBy('timestamp', 'asc').get();
      const history: Discussion[] = historySnapshot.docs.map(doc => doc.data() as Discussion);

      // 2. Call AI Prompt
      const responseText = await generateResponse(path, history, discussion, aiPersona, context);

      // 3. Save AI response to Firestore
      const aiDiscussion: Discussion = {
        author: aiPersona,
        contents: responseText,
        timestamp: Date.now(),
      };
      await db.collection(path).add(aiDiscussion);

    } catch (error: any) {
      console.error(`CRITICAL ERROR in chatWithUserFlow.`, error);
      throw new Error("The AI assistant failed to respond. Please try again.");
    }
  }
);

async function generateResponse(
  path: string,
  history: Discussion[],
  currentDiscussion: Discussion,
  aiPersona: Entity,
  context?: string): Promise<string> {
  const promptInput: PromptInput = {
    history: history.map(h => ({ author: h.author.name, contents: h.contents })),
    currentMessage: currentDiscussion.contents,
    aiPersonaName: aiPersona.name,
    context: context,
  };

  const rawResponse = await EXECUTABLE_PROMPT(promptInput);
  const responseText = rawResponse.text;
  const usage = getUsage(rawResponse?.usage);
  const balance = {currency: Currency.AI, amount: usage}
  const memoAI = `[Chat] response to: ${currentDiscussion.contents.slice(0, 25)}...`;
  await saveTx(path, balance, memoAI);

  return responseText;
}
