import { newUUID } from "@/store/record.js";

/**
 * This
 * @name createRecord
 * @function
 * @param {String} base -
 * @returns {object}
 */
export async function createRecord(base, template) {
  const record = {
    _: base,
    [base]: await newUUID(),
    ...template,
  };

  return record;
}
