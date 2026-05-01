import { v4 as uuidv4 } from "uuid";
import shajs from "sha.js";

/**
 * This
 * @name newUUID
 * @export function
 * @returns {String}
 */
export function newUUID() {
  return shajs("sha256").update(uuidv4()).digest("hex");
}
