import {CallableRequest} from 'firebase-functions/https';
import * as functions from 'firebase-functions';
import {TwoFa} from '../shared/enums';
import * as OTPAuth from "otpauth";
import {TOTP} from "otpauth";

interface TwoFaRequest {
  action: TwoFa,
  code?: string,
}

export async function google2FA(req: CallableRequest<TwoFaRequest>) {
  const { action, code } = req.data;
  console.log(action, code);
  if (!action) throw new functions.https.HttpsError("invalid-argument", "Missing action.");

  switch (action) {
  case TwoFa.Set:
    return getURI(); // set
  case TwoFa.Verify:
    if(!code) throw new functions.https.HttpsError("invalid-argument", "Missing code.");
    return verify(code); // verify
  }
}

function getURI(): any {
  const uri = init().toString();
  console.log(uri)
  return uri ?
    {success: true, message: "ToTp object generated successfully!", uri} :
    {success: false, message: "ToTp generation failed!", uri};
}

function verify(code: string): any {
  const delta = init().validate({token: code, window: 1});
  return delta === 0 ?
    {success: true, message: "The OTP is correct!", delta} :
    {success: false, message: "Wrong OTP!", delta};
}

function init(): TOTP {
  return new OTPAuth.TOTP({
    issuer: "WTF",
    label: "Write The Future",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: "NB2W45DFOIZA", // uid.slice(4,12).toUpperCase(), // or "NB2W45DFOIZA" 'OTPAuth.Secret.fromBase32("NB2W45DFOIZA")'
  });
}
