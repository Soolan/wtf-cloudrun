import { z } from 'genkit';

export const FLOW_INPUT = z.object({
  regenerate: z.boolean(),
  companyPath: z.string().min(1), // profiles/{profileId}/companies/{companyId}
  topicId: z.string().min(1),
});

export const FLOW_OUTPUT = z.object({
  success: z.boolean(),
  message: z.string(),
  chunkCount: z.number().optional()
});
