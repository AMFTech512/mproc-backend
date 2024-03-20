import { generateRegistrationOptions } from "@simplewebauthn/server";
import Joi from "joi";
import { AuthenticatorRow } from "./webauthn-authenticator-repo";

export interface WebAuthnConfig {
  rpName: string;
  rpID: string;
  attestationType: AttestationConveyancePreference;
}

export function getWebAuthnConfig(): WebAuthnConfig {
  return Joi.attempt(
    {
      rpName: process.env.WEBAUTHN_RP_NAME,
      rpID: process.env.WEBAUTHN_RP_ID,
      attestationType: process.env.WEBAUTHN_ATTESTATION_TYPE,
    },
    Joi.object({
      rpName: Joi.string().required(),
      rpID: Joi.string().required(),
      attestationType: Joi.string()
        .valid("direct", "enterprise", "indirect", "none")
        .default("none"),
    })
  );
}

export async function getRegistrationOptions(
  config: WebAuthnConfig,
  userID: string,
  userName: string,
  existingAuthenticators?: AuthenticatorRow[]
) {
  return await generateRegistrationOptions({
    rpName: config.rpName,
    rpID: config.rpID,
    userID,
    userName,
    // Don't prompt users for additional information about the authenticator
    // (Recommended for smoother UX)
    attestationType: config.attestationType,
    excludeCredentials: existingAuthenticators?.map((authenticator) => ({
      id: authenticator.credentialID,
      type: "public-key",
      // Optional
      transports: authenticator.transports,
    })),
  });
}
