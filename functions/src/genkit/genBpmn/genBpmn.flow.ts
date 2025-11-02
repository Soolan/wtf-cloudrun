import { z } from "genkit";
import { VERTEX_AI } from "../shared/ai";
import { FLOW_INPUT, FLOW_OUTPUT, PROMPT_INPUT } from "./genBpmn.schema";
import { EXECUTABLE_PROMPT, FLOW_CONFIG } from "./genBpmn.config";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { FlowStatus } from "../../shared/enums";
import { Topic } from '../../shared/interfaces';

type FlowInput = z.infer<typeof FLOW_INPUT>;
type FlowOutput = z.infer<typeof FLOW_OUTPUT>;
type PromptInput = z.infer<typeof PROMPT_INPUT>;

const BpmnGraphSchema = z.object({
  participants: z.array(z.object({
    name: z.string(),
    nodes: z.array(z.object({
      id: z.string(),
      type: z.string(),
      label: z.string(),
    }))
  })),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    type: z.enum(['sequence', 'message']),
    label: z.string().optional(),
  }))
});
type BpmnGraph = z.infer<typeof BpmnGraphSchema>;

export const genBpmnFlow = VERTEX_AI.defineFlow(
  FLOW_CONFIG,
  async (input: FlowInput): Promise<FlowOutput> => {
    const db = getFirestore();
    const storage = getStorage().bucket();
    const startTime = Date.now();
    const { flowId, topicId, path } = input;
    const flowRef = db.collection("flows").doc(flowId);

    try {
      await flowRef.update({ progress: 20, messages: FieldValue.arrayUnion("Extracting process from topic...") });

      const topicRef = db.doc(`${path}/${topicId}`);
      const topicSnap = await topicRef.get();
      if (!topicSnap.exists) throw new Error("Topic not found");
      const topic = topicSnap.data() as Topic;
      if (!topic.fullText) throw new Error("Topic contents not found");

      await flowRef.update({ progress: 40, messages: FieldValue.arrayUnion("Invoking AI to generate process graph...") });

      const promptInput: PromptInput = { fullText: topic.fullText };
      const graph = await prompt(promptInput);

      await flowRef.update({ progress: 60, messages: FieldValue.arrayUnion("Building BPMN XML from graph...") });

      const bpmnXml = buildBpmnFromGraph(graph);

      await flowRef.update({ progress: 80, messages: FieldValue.arrayUnion("Uploading diagram to storage...") });

      const fileName = `${topicId}.bpmn`;
      const filePath = `${path}/${fileName}`;
      const file = storage.file(filePath);
      await file.save(bpmnXml, { contentType: "application/xml" });

      const bpmnResource = { name: fileName, url: filePath };
      await topicRef.update({ bpmn: bpmnResource });

      await flowRef.update({ status: FlowStatus.Completed, progress: 100, messages: FieldValue.arrayUnion("BPMN generation complete."), duration_ms: Date.now() - startTime, result: { fileName, filePath } });

      return { fileName, filePath };
    } catch (err: any) {
      console.error("CRITICAL ERROR in genBpmnFlow:", err);
      if (flowId) {
        await flowRef.update({ status: FlowStatus.Error, messages: FieldValue.arrayUnion("BPMN generation failed."), error: err.message, duration_ms: Date.now() - startTime });
      }
      throw new Error("BPMN generation failed. Please retry.");
    }
  }
);

async function prompt(input: PromptInput): Promise<BpmnGraph> {
  const raw = await EXECUTABLE_PROMPT(input);
  let text = raw.text;

  // Use a regex to find the content inside ```json ... ```, or fallback to the first/last curly brace.
  const match = text.match(/```json\n([\s\S]*?)\n```/);

  if (match && match[1]) {
    text = match[1];
  } else {
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      text = text.substring(startIndex, endIndex + 1);
    } else {
        console.error("Could not find any JSON in the AI output:", text);
        throw new Error("AI did not return any JSON.");
    }
  }

  try {
    let parsed = JSON.parse(text);
    if (parsed.bpmn && typeof parsed.bpmn === 'string') {
      parsed = JSON.parse(parsed.bpmn);
    }
    return BpmnGraphSchema.parse(parsed);
  } catch (e) {
    console.error("Failed to parse extracted JSON graph from AI output:", text, e);
    throw new Error("AI did not return a valid JSON graph.");
  }
}

function buildBpmnFromGraph(graph: BpmnGraph): string {
  const collaborationId = `Collaboration_${(Math.random() + 1).toString(36).substring(7)}`;
  let participantsXml = '';
  let processesXml = '';
  let diagramXml = '';

  const nodeToParticipant = new Map<string, any>();
  graph.participants.forEach(p => p.nodes.forEach(n => nodeToParticipant.set(n.id, p)));

  const nodePositions = new Map<string, { x: number, y: number }>();
  const nodeShapes: { [key: string]: string } = {};

  graph.participants.forEach((participant, pIndex) => {
    const processId = `Process_${pIndex}`;
    const participantId = `Participant_${pIndex}`;
    participantsXml += `
    <bpmn2:participant id="${participantId}" name="${participant.name}" processRef="${processId}" />`;

    const nodeFlows: { [key: string]: { incoming: string[], outgoing: string[] } } = {};
    participant.nodes.forEach(n => { nodeFlows[n.id] = { incoming: [], outgoing: [] }; });

    const sequenceFlows = graph.edges.filter(e => e.type === 'sequence' && nodeToParticipant.get(e.source) === participant && nodeToParticipant.get(e.target) === participant);
    sequenceFlows.forEach(edge => {
      if (nodeFlows[edge.source]) nodeFlows[edge.source].outgoing.push(edge.id);
      if (nodeFlows[edge.target]) nodeFlows[edge.target].incoming.push(edge.id);
    });

    let processElements = '';
    participant.nodes.forEach(node => {
      const incoming = nodeFlows[node.id].incoming.map(f => `<bpmn2:incoming>${f}</bpmn2:incoming>`).join('\n      ');
      const outgoing = nodeFlows[node.id].outgoing.map(f => `<bpmn2:outgoing>${f}</bpmn2:outgoing>`).join('\n      ');
      processElements += `
      <bpmn2:${node.type} id="${node.id}" name="${node.label}">${incoming}${outgoing}</bpmn2:${node.type}>`;
    });
    sequenceFlows.forEach(edge => {
      processElements += `
      <bpmn2:sequenceFlow id="${edge.id}" sourceRef="${edge.source}" targetRef="${edge.target}" name="${edge.label || ''}" />`;
    });

    processesXml += `
  <bpmn2:process id="${processId}" isExecutable="false">${processElements}
  </bpmn2:process>`;
  });

  const messageFlows = graph.edges.filter(e => e.type === 'message');
  messageFlows.forEach(mf => {
    participantsXml += `
    <bpmn2:messageFlow id="${mf.id}" sourceRef="${mf.source}" targetRef="${mf.target}" name="${mf.label || ''}" />`;
  });

  // Layout logic
  let pY = 150;
  graph.participants.forEach((p, pIndex) => {
    const participantId = `Participant_${pIndex}`;
    diagramXml += `
      <bpmndi:BPMNShape id="Shape_${participantId}" bpmnElement="${participantId}" isHorizontal="true"><dc:Bounds x="150" y="${pY}" width="1200" height="250" /></bpmndi:BPMNShape>`;
    let nX = 250;
    p.nodes.forEach(n => {
      const shapeId = `Shape_${n.id}`;
      nodeShapes[n.id] = shapeId;
      const nodeY = pY + 80;
      nodePositions.set(n.id, { x: nX, y: nodeY });
      diagramXml += `
        <bpmndi:BPMNShape id="${shapeId}" bpmnElement="${n.id}"><dc:Bounds x="${nX}" y="${nodeY}" width="100" height="80" /></bpmndi:BPMNShape>`;
      nX += 200;
    });
    pY += 300;
  });

  graph.edges.forEach(e => {
    const sourcePos = nodePositions.get(e.source);
    const targetPos = nodePositions.get(e.target);
    const sourceShapeId = nodeShapes[e.source];
    const targetShapeId = nodeShapes[e.target];

    if (sourcePos && targetPos && sourceShapeId && targetShapeId) {
      const sourceX = sourcePos.x + 100; // Mid-right
      const sourceY = sourcePos.y + 40;  // Mid-point
      const targetX = targetPos.x;
      const targetY = targetPos.y + 40;
      diagramXml += `
      <bpmndi:BPMNEdge id="Edge_${e.id}" bpmnElement="${e.id}" sourceElement="${sourceShapeId}" targetElement="${targetShapeId}"><di:waypoint xsi:type=\"dc:Point\" x="${sourceX}" y="${sourceY}" /><di:waypoint xsi:type=\"dc:Point\" x="${targetX}" y="${targetY}" /></bpmndi:BPMNEdge>`;
    }
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="empty-definitions" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn2:collaboration id="${collaborationId}">${participantsXml}
  </bpmn2:collaboration>${processesXml}
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${collaborationId}">${diagramXml}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`;
}
