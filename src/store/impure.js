import { searchParamsToQuery } from "@/query/pure.js";
import { newUUID, updateMind, updateEntry } from "@/store/record.js";
import { saveMindRecord, loadMindRecord } from "@/proxy/record.js";
import defaultMindRecord from "@/store/default_mind_record.json";

/**
 * This
 * @name updateRecord
 * @function
 * @param {object} mind -
 * @param {String} base -
 * @param {object} recordNew -
 */
export async function updateRecord(api, mind, base, recordNew) {
  const isHomeScreen = mind === "root";

  const isMindBranch = base === "mind";

  const canSaveMind = isHomeScreen && isMindBranch;

  if (canSaveMind) {
    await updateMind(api, recordNew);

    await saveMindRecord(api, recordNew);
  } else {
    await updateEntry(api, mind, recordNew);
  }
}

/**
 * This
 * @name selectStream
 * @function
 * @param {object} schema -
 * @param {object} mind -
 * @param {Function} appendRecord -
 * @param {SearchParams} searchParams -
 * @returns {object}
 */
export async function selectStream(
  api,
  schema,
  mind,
  appendRecord,
  searchParams,
  streamCounter,
) {
  // prepare a controller to stop the new stream
  let isAborted = false;

  const abortController = new AbortController();

  function abortPreviousStream() {
    isAborted = true;

    abortController.abort();
  }

  // remove all evenor-specific searchParams before passing to csvs
  const searchParamsWithoutCustom = new URLSearchParams(
    Array.from(searchParams.entries()).filter(([key]) => !key.startsWith(".")),
  );

  const query = searchParamsToQuery(schema, searchParamsWithoutCustom);

  const streamid = streamCounter.toString();

  // construct a new readable stream which calls api.selectStream many times
  const fromStrm = new ReadableStream({
    async pull(controller) {
      const { done, value } = await api.selectStream(mind, streamid, query);

      if (done) {
        controller.close();

        return;
      }

      controller.enqueue(value);
    },
  });

  // create a stream that appends to records
  const toStrm = new WritableStream({
    async write(chunk) {
      if (isAborted) {
        return;
      }

      const key = chunk[chunk._];

      appendRecord(key);
    },

    abort() {
      // stream interrupted
      // no need to await on the promise, closing api stream for cleanup
      //closeHandler();
    },
  });

  async function startStream() {
    return fromStrm.pipeTo(toStrm, { signal: abortController.signal });
  }

  return { abortPreviousStream, startStream };
}

export async function buildRecord(api, mind, record) {
  const fetched = await api.buildRecord(mind, record);

  const isHomeScreen = mind === "root";

  const recordNew = isHomeScreen ? await loadMindRecord(api, fetched) : fetched;

  return recordNew;
}

/**
 * This
 * @name createRecord
 * @function
 * @param {object} mind -
 * @param {String} base -
 * @returns {object}
 */
export async function createRecord(mind, base) {
  const isHomeScreen = mind === "root";

  const isMindBranch = base === "mind";

  const isMindRecord = isHomeScreen && isMindBranch;

  const mindPartial = isMindRecord ? defaultMindRecord : {};

  const record = {
    _: base,
    [base]: await newUUID(),
    ...mindPartial,
  };

  return record;
}
