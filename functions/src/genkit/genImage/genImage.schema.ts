import {z} from "genkit";
import {MediaCategory} from "../../shared/enums";

export const FLOW_INPUT = z.object({
  path: z.string(),
  prompt: z.string(),
  mediaCategory: z.nativeEnum(MediaCategory),
  orientation: z.enum(["portrait", "landscape"]).optional() // only used for Image
});

export const PROMPT_INPUT = z.object({
  prompt: z.string()
    .min(10, "min 10 char required")
    .max(250, "max 300 char required"),
});

export const FLOW_OUTPUT = z.object({
  success: z.boolean(),
  message: z.string(),
  imageUrl: z.string(),
});
