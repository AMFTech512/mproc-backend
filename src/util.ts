import Joi from "joi";
import cors from "cors";
import { DIContainer } from "./di";

/**
 * Takes an object and returns a set clause string and
 * an array of ordered values to be used in a sql update query.
 * Returns a tuple of [set clause string, values array, next param index].
 * Use the options.exclude parameter to exclude certain keys from the set clause.
 * @param obj
 * @param options
 * @returns
 */
export function makeSetClause(
  obj: object,
  options?: { exclude?: string[] }
): [string, unknown[], number] {
  const parts: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && !options?.exclude?.includes(key)) {
      parts.push(`${key} = $${idx++}`);
      values.push(value);
    }
  });

  return [parts.join(", "), values, idx];
}

/**
 * Takes an object and returns an insert clause string and
 * an array of ordered values to be used in a sql insert query.
 * Returns a tuple of [set clause string, values array, next param index].
 * Use the options.exclude parameter to exclude certain keys from the set clause.
 * @param obj
 * @param options
 * @returns
 */
export function makeInsertClause(
  obj: object,
  options?: { exclude?: string[] }
): [string, unknown[], number] {
  const values: unknown[] = [];
  const keys: string[] = Object.keys(obj).filter((key) => {
    const value = (obj as Record<string, unknown>)[key];
    if (value !== undefined && !options?.exclude?.includes(key)) {
      values.push(value);
      return true;
    } else {
      return false;
    }
  });

  const placeholders = keys.map((_, i) => `$${i + 1}`);
  const insertClause = `(${keys.join(", ")}) VALUES (${placeholders.join(
    ", "
  )})`;

  return [insertClause, values, keys.length + 1];
}

export function generateSecureRandomString(length = 16) {
  return crypto
    .getRandomValues(new Uint8Array(length))
    .reduce((acc, byte) => acc + byte.toString(16).padStart(2, "0"), "");
}

/**
 * A custom validator for Joi that checks if a string is valid JSON.
 * @param value
 * @param helpers
 * @returns
 */
export const validateJson: Joi.CustomValidator<string, object> = (
  value,
  helpers
) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return helpers.error("Invalid JSON");
  }
};

export const oneMonthFromNow = () =>
  new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
