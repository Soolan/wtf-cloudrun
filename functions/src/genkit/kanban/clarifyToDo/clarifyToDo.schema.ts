import {z} from 'zod';

export const EntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string(),
});

export const ResourceSchema = z.object({
  name: z.string(),
  url: z.string(),
  type: z.string(),
});

export const TaskClarificationSchema = z.object({
  isValid: z.boolean(),
  hasBPMN: z.boolean(),
  hasSubtasks: z.boolean(),
  hasKb: z.boolean(),
  usesTool: z.boolean(),
  hasAccess: z.boolean(),
  doable: z.boolean(),
});

export const TicketSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  attachments: z.array(ResourceSchema).optional(),
  process: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  assignedTo: EntitySchema.optional(),
  clarification: TaskClarificationSchema.optional(),
});

export type Ticket = z.infer<typeof TicketSchema>;
