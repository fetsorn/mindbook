import { recordsToSchema, schemaToBranchRecords } from "@/query/pure.js";
import schemaRoot from "@/proxy/default_root_schema.json";

/**
 * This
 * @name deleteRecord
 * @export function
 * @param {object} mind -
 * @param {object} record -
 */
export async function deleteRecord(api, mind, record) {
  await api.deleteRecord(mind, record);

  await api.commit(mind);
}

/**
 * This
 * @name updateMind
 * @export function
 * @param {object} recordNew -
 */
export async function updateMind(api, recordNew) {
  // won't save root/branch-trunk.csv to disk as it's read from mind/_-_.csv
  // TODO move this outside and merge updateMind with updateEntry
  const branchesPartial =
    recordNew.branch !== undefined
      ? {
          branches: recordNew.branch.map(
            // eslint-disable-next-line
            ({ trunk, ...branchWithoutTrunk }) => branchWithoutTrunk,
          ),
        }
      : {};

  const recordPruned = { ...recordNew, ...branchesPartial };

  await api.updateRecord("root", recordPruned);

  await api.commit("root");
}

/**
 * This
 * @name updateEntry
 * @export function
 * @param {object} mind -
 * @param {object} recordNew -
 */
export async function updateEntry(api, mind, recordNew) {
  await api.updateRecord(mind, recordNew);

  await api.commit(mind);
}

/**
 * This
 * @name readSchema
 * @export function
 * @param {String} mind -
 * @returns {object}
 */
export async function readSchema(api, mind) {
  if (mind === "root") {
    return schemaRoot;
  }

  const [schemaRecord] = await api.select(mind, { _: "_" });

  const branchRecords = await api.select(mind, { _: "branch" });

  const schema = recordsToSchema(schemaRecord, branchRecords);

  return schema;
}

// TODO rename to differ from solidjs "createRoot"
/**
 * This
 * @name createRoot
 * @export function
 */
export async function createRoot(api) {
  try {
    // fails if root exists
    await api.gitinit("root");

    await api.csvsinit("root");

    const branchRecords = schemaToBranchRecords(schemaRoot);

    for (const branchRecord of branchRecords) {
      await api.updateRecord("root", branchRecord);
    }

    await api.commit("root");
  } catch (e) {
    if (e.message === "EEXIST") {
      console.log("root exists");
    } else {
      console.log(e);
    }
    // do nothing
  }
}
