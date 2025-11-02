import { z } from "genkit";
import { VERTEX_AI } from "../shared/ai";
import { FLOW_INPUT, FLOW_OUTPUT, PROMPT_INPUT, PROMPT_OUTPUT } from "./chatBpmnEligibility.schema";
import { EXECUTABLE_PROMPT, FLOW_CONFIG } from "./chatBpmnEligibility.config";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { FlowStatus } from "../../shared/enums";
import {Topic} from '../../shared/interfaces';

type FlowInput = z.infer<typeof FLOW_INPUT>;
type FlowOutput = z.infer<typeof FLOW_OUTPUT>;
type PromptInput = z.infer<typeof PROMPT_INPUT>;
type PromptOutput = z.infer<typeof PROMPT_OUTPUT>;

export const chatBpmnEligibilityFlow = VERTEX_AI.defineFlow(
  FLOW_CONFIG,
  async (input: FlowInput): Promise<FlowOutput> => {
    const db = getFirestore();
    const startTime = Date.now();
    const { flowId, topicId, path, creator } = input;
    const flowRef = db.collection("flows").doc(flowId);

    console.log(topicId);
    try {
      await flowRef.update({
        progress: 20,
        messages: FieldValue.arrayUnion("Assessing BPMN eligibility..."),
      });

      // Load the topic fullText
      const topicRef = db.doc(`${path}/${topicId}`);
      const topicSnap = await topicRef.get();
      if (!topicSnap.exists) throw new Error("Topic not found");
      const topic = topicSnap.data() as Topic;
      if (!topic.fullText) throw new Error("Topic contents not found");

      const promptInput: PromptInput = { fullText: topic.fullText };
      const assessment: PromptOutput = await prompt(promptInput);

      // Save inline into topic
      await topicRef.update({ bpmnEligibility: assessment });

      // Add to discussions
      const discussion = {
        author: creator,
        timestamp: Date.now(),
        contents: getAssessment(assessment).trim(),
      };
      await topicRef.collection("discussions").add(discussion);

      await flowRef.update({
        status: FlowStatus.Completed,
        progress: 100,
        messages: FieldValue.arrayUnion("BPMN assessment complete."),
        duration_ms: Date.now() - startTime,
        result: { assessment },
      });

      return { assessment };
    } catch (err: any) {
      console.error("CRITICAL ERROR in genBpmnEligibilityFlow:", err);
      if (flowId) {
        await flowRef.update({
          status: FlowStatus.Error,
          messages: FieldValue.arrayUnion("Eligibility check failed."),
          error: err.message,
          duration_ms: Date.now() - startTime,
        });
      }
      throw new Error("Eligibility check failed. Please retry.");
    }
  }
);

async function prompt(input: PromptInput): Promise<PromptOutput> {
  const raw = await EXECUTABLE_PROMPT(input);
  const parsed = JSON.parse(raw.text);
  return PROMPT_OUTPUT.parse(parsed);
}

function getAssessment(assessment: PromptOutput) {
  return `
📊 BPMN Eligibility Assessment Score: ${assessment.score}/10

- Participants: ${assessment.hasParticipants ? "✅" : "❌"}
- Activities: ${assessment.hasActivities ? "✅" : "❌"}
- Decisions: ${assessment.hasDecisions ? "✅" : "❌"}
- Sequence: ${assessment.hasSequence ? "✅" : "❌"}
- Artifacts: ${assessment.hasArtifacts ? "✅" : "❌"}

Recommendations:
${assessment.recommendations.map(r => `- ${r}`).join("\n")}

Would you like to proceed with BPMN generation or update the topic?
        `;
}
