import {z} from "genkit";
import {getFirestore} from "firebase-admin/firestore";
import {FLOW_INPUT, FLOW_OUTPUT} from "./genKbChunks.schema";
import {VERTEX_AI} from '../shared/ai';
import {textEmbeddingGecko003} from '@genkit-ai/vertexai';
import {Topic} from '../../shared/interfaces';
import {FLOW_CONFIG} from './genKbChunks.config';
import {NOW} from '../../shared/constants';

type FlowInput = z.infer<typeof FLOW_INPUT>;
type FlowOutput = z.infer<typeof FLOW_OUTPUT>;
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

export const genKbChunksFlow = VERTEX_AI.defineFlow(
  FLOW_CONFIG,
  async (input: FlowInput): Promise<FlowOutput> => {
    const db = getFirestore();
    const {companyPath, topicId, regenerate} = input;
    if(regenerate) await deleteChunks(companyPath, topicId, db);

    try {
      const topicSnap =
        await db.doc(`${companyPath}/playbook/${topicId}`).get();
      if (!topicSnap.exists) {
        return {
          success: false,
          message: `Topic not found at ${companyPath}/playbook/${topicId}`,
        };
      }

      const topic = topicSnap.data() as Topic;
      const kbDocPath = `${companyPath}/kb/${topicId}`; // we store kb docs with the same id as topic docs
      await db.doc(kbDocPath).set({
        title: topic.title,
        summary: topic.subtitle,
        tags: topic.tags,
        chunkCount: 0,
        hasBPMN: topic.bpmn !== undefined,
        timestamps: NOW
      });

      const fullText = topic.fullText?.trim();
      if (!fullText || fullText.length < 100) {
        return {
          success: false,
          message: `Topic contents are too short or missing.`,
        };
      }
      const chunks = await setChunks(fullText, kbDocPath, db);
      await db.doc(kbDocPath).update({chunkCount: chunks.content.length});

      return {
        success: true,
        message: `Kb & chunks generated successfully.`,
        chunkCount: chunks.content.length,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Kb generation failed: ${err.message?.slice(0, 180) ?? "Unknown error"}`,
      };
    }
  }
);

async function deleteChunks(companyPath: string, topicId: string, db: any) {
  const chunksCollection = `${companyPath}/kb/${topicId}/chunks`;
  const chunkSnap = await db.collection(chunksCollection).get();
  const batch = db.batch();

  chunkSnap.docs.forEach((doc: any) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

async function setChunks(fullText: string, kbDocPath: string, db: any) {
  const chunks = chunkText(fullText, CHUNK_SIZE, CHUNK_OVERLAP);
  const results = await VERTEX_AI.embed({
    embedder: textEmbeddingGecko003, //"textembedding-gecko@003",
    content: chunks
  });
  const embeddings = results.map((res) => res.embedding);
  const batch = db.batch();
  const chunksCollection = `${kbDocPath}/chunks`;

  chunks.content.forEach((text, i) => {
    const docRef = db.collection(chunksCollection).doc();
    batch.set(docRef, {
      text,
      embedding: embeddings[i],
      created_at: new Date(),
    });
  });
  await batch.commit();
  return chunks;
}

interface ChunkContent {
  content: {
    text: string
  }[];
}

function chunkText(text: string, size = 1000, overlap = 200): ChunkContent {
  const content: { text: string }[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    content.push({text: text.slice(start, end)});
    start += size - overlap;
  }
  return {content};
}
