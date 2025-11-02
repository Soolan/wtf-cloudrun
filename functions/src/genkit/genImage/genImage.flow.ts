import {getStorage} from "firebase-admin/storage";
import {Buffer} from "buffer";
import {z} from "genkit";
import {
  AVATAR_DIMS,
  AVATAR_EXECUTABLE_PROMPT,
  BANNER_DIMS,
  BANNER_EXECUTABLE_PROMPT,
  EXECUTABLE_PROMPT,
  FLOW_CONFIG,
  IMAGE_LANDSCAPE_DIMS,
  IMAGE_PORTRAIT_DIMS,
  LANDSCAPE_IMAGE_EXECUTABLE_PROMPT,
  LOGO_DIMS,
  LOGO_EXECUTABLE_PROMPT,
  PORTRAIT_IMAGE_EXECUTABLE_PROMPT
} from "./genImage.config";
import {FLOW_INPUT, FLOW_OUTPUT} from "./genImage.schema";
import {VERTEX_AI} from "../shared/ai";
import {Currency, MediaCategory} from "../../shared/enums";
import sharp from "sharp";
import {saveTx} from '../shared/utils';

// Infer types from zod schemas
type FlowInput = z.infer<typeof FLOW_INPUT>;
type FlowOutput = z.infer<typeof FLOW_OUTPUT>;

let memoAI = '';
let memoGB = '';

export const genImageFlow = VERTEX_AI.defineFlow(
  FLOW_CONFIG,
  async (input: FlowInput): Promise<FlowOutput> => {
    try {
      console.log(input);
      const imageBase64 = await generate(input);
      const imageUrl = await save(input, imageBase64);
      const {prompt, path} = input;
      const tokens = prompt.length/4 + 250; // imagen 3 costs roughly 250 tokens per generated image
      const balance = {currency: Currency.AI, amount: tokens}
      await saveTx(path, balance, memoAI);

      return {
        success: true,
        message: "Image generated successfully.",
        imageUrl,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Image generation failed: ${error.message}`,
        imageUrl: "",
      };
    }
  }
);

async function generate(input: FlowInput): Promise<string> {
  let response: any;
  const {prompt, mediaCategory, orientation} = input;
  if (mediaCategory === MediaCategory.Avatar) {
    response = await AVATAR_EXECUTABLE_PROMPT({prompt});
    memoAI = `[Avatar] ${prompt.slice(0, 40)}...`
  } else if (mediaCategory === MediaCategory.Banner) {
    response = await BANNER_EXECUTABLE_PROMPT({prompt});
    memoAI = `[Banner] ${prompt.slice(0, 40)}...`
  } else if (mediaCategory === MediaCategory.Logo) {
    response = await LOGO_EXECUTABLE_PROMPT({prompt});
    memoAI = `[Logo] ${prompt.slice(0, 40)}...`
  } else if (mediaCategory === MediaCategory.Image) {
    response = orientation === "portrait" ?
      await PORTRAIT_IMAGE_EXECUTABLE_PROMPT({prompt}) :
      await LANDSCAPE_IMAGE_EXECUTABLE_PROMPT({prompt});
    memoAI = `[Image] ${prompt.slice(0, 40)}...`
  } else {
    response = await EXECUTABLE_PROMPT({prompt});
    memoAI = `[Other] ${prompt.slice(0, 40)}...`
  }
  // @ts-ignore
  return response.custom.predictions[0].bytesBase64Encoded;
}

async function save(input: FlowInput, base64Data: string): Promise<string> {
  const {path, prompt, mediaCategory, orientation} = input;
  const bucket = getStorage().bucket("wtf-workspace-ad6a4.appspot.com");
  const buffer = Buffer.from(base64Data, "base64");

  const originalFile = bucket.file(path);
  await originalFile.save(buffer, {
    contentType: "image/webp",
    metadata: {
      public: true,
      cacheControl: "public,max-age=31536000",
      customMetadata: {prompt},
    },
  });
  await originalFile.makePublic(); // ✅ ACTUALLY makes it public - and it is different from .publicUrl().
  const originalFileInKB = buffer.length / 1024; // File size in KB
  memoGB = `[Storage] Original image: ${Math.floor(originalFileInKB)} Kb`;
  await saveTx(path, {currency: Currency.GB, amount: originalFileInKB/(1024 ** 2)}, memoGB);

  // ✅ Prepare resized buffer using sharp (e.g., 400px max size)
  const resizedBuffer = await sharp(buffer)
    .resize(getDimension(mediaCategory, orientation)) // maintains aspect ratio
    .webp({quality: 92})
    .toBuffer();

  // ✅ Construct new path for resized file
  const resizedPath = path.replace("-original.webp", "-resized.webp");
  const resizedFile = bucket.file(resizedPath);

  // Save resized file
  await resizedFile.save(resizedBuffer, {
    contentType: "image/webp",
    metadata: {
      public: true,
      cacheControl: "public,max-age=31536000",
      customMetadata: {prompt, resizedFrom: path},
    },
  });
  await resizedFile.makePublic(); // ✅ Make public
  console.log(path, resizedPath);

  const resizedFileInKB = resizedBuffer.length / 1024; // File size in KB
  memoGB = `[Storage] Resized image: ${Math.floor(resizedFileInKB)} Kb`;

  await saveTx(path, {currency: Currency.GB, amount: resizedFileInKB/(1024 ** 2)}, memoGB);

  // ✅ Return resized file’s public URL
  return resizedFile.publicUrl();
}

function getDimension(media: MediaCategory, orientation?: string): any {
  switch (media) {
  case MediaCategory.Avatar:
    return {width: AVATAR_DIMS.width, height: AVATAR_DIMS.height, fit: "cover"};
  case MediaCategory.Logo:
    return {width: LOGO_DIMS.width, height: LOGO_DIMS.height, fit: "cover"};
  case MediaCategory.Banner:
    return {width: BANNER_DIMS.width, height: BANNER_DIMS.height, fit: "cover"};
  case MediaCategory.Image:
    return orientation === "portrait" ?
      {width: IMAGE_PORTRAIT_DIMS.width, height: IMAGE_PORTRAIT_DIMS.height, fit: "cover"}:
      {width: IMAGE_LANDSCAPE_DIMS.width, height: IMAGE_LANDSCAPE_DIMS.height, fit: "cover"};
  default:
    return {width: 600, height: 600, fit: "cover"};
  }
}
