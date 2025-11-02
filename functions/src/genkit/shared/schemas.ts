import {z} from "genkit";

export const CREATOR_SCHEMA = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string(),
});

export const RESOURCE_SCHEMA = z.object({
  url: z.string().url("Invalid URL format"), // error message for invalid urls
  name: z.string(),
});

export const TIMESTAMPS_SCHEMA = z.object({
  created_at: z.number().int().nonnegative(),
  updated_at: z.number().int().nonnegative(),
  deleted_at: z.number().int().nonnegative(),
}).transform(() => ({
  created_at: Date.now(),
  updated_at: Date.now(),
  deleted_at: 0,
}));
