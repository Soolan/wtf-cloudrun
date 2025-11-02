import {FLOW_INPUT, FLOW_OUTPUT, PROMPT_INPUT} from "./genImage.schema";
import {PromptConfig} from "genkit";
import {VERTEX_AI} from "../shared/ai";

export const FLOW_CONFIG = {
  name: "genImageFlow",
  inputSchema: FLOW_INPUT,
  outputSchema: FLOW_OUTPUT,
};

export const PROMPT_CONFIG: PromptConfig = {
  name: "genImage",
  input: {
    schema: PROMPT_INPUT
  },
  output: {
    format: "media",
  },
  model: "vertexai/imagen3-fast",
  config: {
    temperature: 0.6,
    aspectRatio: "1:1"
  },
};

export const AVATAR_PROMPT_CONFIG: PromptConfig = {
  ...PROMPT_CONFIG,
  name: "genAvatar",
};

export const LOGO_PROMPT_CONFIG: PromptConfig = {
  ...PROMPT_CONFIG,
  name: "genLogo",
};

export const BANNER_PROMPT_CONFIG: PromptConfig = {
  ...PROMPT_CONFIG,
  name: "genBanner",
  config: { ...PROMPT_CONFIG.config, aspectRatio: "16:9" }
};

export const PORTRAIT_IMAGE_PROMPT_CONFIG = {
  ...PROMPT_CONFIG,
  name: "genImagePortrait",
  config: { ...PROMPT_CONFIG.config, aspectRatio: "3:4" }
};

export const LANDSCAPE_IMAGE_PROMPT_CONFIG = {
  ...PROMPT_CONFIG,
  name: "genImageLandscape",
  config: { ...PROMPT_CONFIG.config, aspectRatio: "4:3" }
};

export const AVATAR_DIMS: any = {width: 360, height: 360};
export const LOGO_DIMS: any = {width: 300, height: 300};
export const BANNER_DIMS: any = {width: 1408, height: 300};
export const IMAGE_LANDSCAPE_DIMS: any = {width: 800, height: 600};
export const IMAGE_PORTRAIT_DIMS: any = {width: 600, height: 800};

export const EXECUTABLE_PROMPT: any = VERTEX_AI.definePrompt(PROMPT_CONFIG, "{{prompt}}");
export const AVATAR_EXECUTABLE_PROMPT: any = VERTEX_AI.definePrompt(AVATAR_PROMPT_CONFIG, "{{prompt}}");
export const BANNER_EXECUTABLE_PROMPT: any = VERTEX_AI.definePrompt(BANNER_PROMPT_CONFIG, "{{prompt}}");
export const LOGO_EXECUTABLE_PROMPT: any = VERTEX_AI.definePrompt(LOGO_PROMPT_CONFIG, "{{prompt}}");
export const PORTRAIT_IMAGE_EXECUTABLE_PROMPT: any = VERTEX_AI.definePrompt(PORTRAIT_IMAGE_PROMPT_CONFIG, "{{prompt}}");
export const LANDSCAPE_IMAGE_EXECUTABLE_PROMPT: any = VERTEX_AI.definePrompt(LANDSCAPE_IMAGE_PROMPT_CONFIG, "{{prompt}}");
