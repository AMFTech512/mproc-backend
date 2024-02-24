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
