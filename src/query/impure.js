import { newUUID } from "@/query/record.js";

/**
 * This
 * @name createRecord
 * @function
 * @param {object} mind -
 * @param {String} base -
 * @returns {object}
 */
export async function createRecord(mind, base, template) {
  const record = {
    _: base,
    [base]: await newUUID(),
    ...template,
  };

  return record;
}
