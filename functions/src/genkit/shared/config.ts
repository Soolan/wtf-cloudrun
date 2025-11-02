import {CallableOptions, hasClaim} from "firebase-functions/https";
import {defineSecret} from "firebase-functions/params";

export const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

export const SECRET_AUTH_POLICY: CallableOptions = {
  secrets: [GEMINI_API_KEY],
  authPolicy: hasClaim("email_verified"),
}

export const SECRET_AUTH_POLICY_APP_CHECK: CallableOptions = {
  secrets: [GEMINI_API_KEY],
  authPolicy: hasClaim("email_verified"),
  enforceAppCheck: true,
  consumeAppCheckToken: true
}
