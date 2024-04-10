import Airtable from "airtable";
import Joi from "joi";

export interface AirtableConfig {
  apiKey: string;
}

export function getAirtableConfig(): AirtableConfig {
  return Joi.attempt(
    {
      apiKey: process.env.AIRTABLE_API_KEY,
    },
    Joi.object({
      apiKey: Joi.string().required(),
    })
  );
}

export function initAirtableClient(config?: AirtableConfig) {
  const _config = config || getAirtableConfig();
  return new Airtable({ apiKey: _config.apiKey });
}
