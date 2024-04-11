import Joi from "joi";
import { Resend } from "resend";

export interface ResendConfig {
  apiKey: string;
}

export function getResendConfig(): ResendConfig {
  return Joi.attempt(
    {
      apiKey: process.env.RESEND_API_KEY,
    },
    Joi.object({
      apiKey: Joi.string().required(),
    })
  );
}

export function initResendClient(config?: ResendConfig) {
  const _config = config || getResendConfig();

  return new Resend(_config.apiKey);
}
