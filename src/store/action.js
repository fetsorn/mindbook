import { updateRecord } from "@/proxy/impure.js";
import { deleteRecord } from "@/proxy/record.js";
import { find, clone } from "@/proxy/open.js";
import { getDefaultBase, pickDefaultSortBy } from "@/query/pure.js";

/**
 * This
 * @name changeMind
 * @function
 * @param {String} pathname -
 * @param {String} searchString -
 * @returns {object}
 */
export async function changeMind(api, pathname, searchString) {
  const mind = pathname === "/" ? "root" : pathname.replace("/", "");

  const searchParams = new URLSearchParams(searchString);

  const remoteUrl = searchParams.get("~");

  const token = searchParams.get("-") ?? "";

  // SEC-12: validate clone URL is http(s) before auto-cloning
  let shouldClone = false;
  if (searchParams.has("~") && remoteUrl) {
    try {
      const parsed = new URL(remoteUrl);
      shouldClone = parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      // invalid URL — don't clone
    }
  }

  const { mind: mindRecord, schema } = shouldClone
    ? await clone(api, remoteUrl, token)
    : await find(api, mind, undefined);

  if (!searchParams.has("_")) {
    searchParams.set("_", getDefaultBase(schema));
  }

  if (!searchParams.has(".sortBy")) {
    searchParams.set(
      ".sortBy",
      pickDefaultSortBy(schema, searchParams.get("_")),
    );
  }

  return {
    mind: mindRecord,
    schema,
    searchParams,
  };
}

/**
 * This
 * @name saveRecord
 * @function
 * @param {String} mind -
 * @param {String} base -
 * @param {object[]} records -
 * @param {object} recordOld -
 * @param {object} recordNew -
 * @returns {object[]}
 */
export async function saveRecord(
  api,
  mind,
  base,
  records,
  recordOld,
  recordNew,
) {
  await updateRecord(api, mind, base, recordNew);

  const keyOld = recordOld[base];

  const keyNew = recordNew[base];

  const recordsNew = records.filter((r) => r !== keyOld).concat([keyNew]);

  return recordsNew;
}

/**
 * This
 * @name wipeRecord
 * @function
 * @param {object} mind -
 * @param {String} base -
 * @param {object[]} records -
 * @param {object} record -
 * @returns {object[]}
 */
export async function wipeRecord(api, mind, base, records, record) {
  await deleteRecord(api, mind, record);

  const key = record[base];

  const recordsNew = records.filter((r) => r !== key);

  return recordsNew;
}
