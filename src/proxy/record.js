import {
  readRemoteTags,
  //readLocalTags,
  writeRemoteTags,
  //writeLocalTags,
} from "@/proxy/tags.js";
import {
  extractSchemaRecords,
  enrichBranchRecords,
  recordsToSchema,
  schemaToBranchRecords,
} from "@/query/pure.js";

/**
 * This
 * @name exportMind
 * @export function
 * @param {String} mind
 */
export async function exportMind(api, mind) {
  await api.zip(mind);
}

/**
 * This
 * @name sync
 * @export function
 * @param {String} mind
 * @param {String} remoteUrl
 * @param {String} remoteToken
 */
export async function resolve(api, mind) {
  const tagsRemote = await readRemoteTags(api, mind);

  let resolveResult = { ok: true };

  for (const tagRemote of tagsRemote) {
    const resolvePartial = await api.resolve(mind, {
      url: tagRemote.origin_url,
      token: tagRemote.origin_token,
    });

    resolveResult.ok = resolveResult.ok && resolvePartial.ok;
  }

  return resolveResult;
}

/**
 * This loads git state and schema from folder into the record
 * @name loadMindRecord
 * @export function
 * @param {object} record
 * @returns {object}
 */
export async function loadMindRecord(api, record) {
  const mind = record.mind;

  const [schemaRecord] = await api.select(mind, { _: "_" });

  // query {_:branch}
  const metaRecords = await api.select(mind, { _: "branch" });

  // add trunk field from schema record to branch records
  const branchRecords = enrichBranchRecords(schemaRecord, metaRecords);

  const branchPartial = { branch: branchRecords };

  const tagsRemote = await readRemoteTags(api, mind);

  // get remote
  const tagsRemotePartial =
    tagsRemote.length > 0 ? { origin_url: tagsRemote } : {};

  //const tagsLocal = await readLocalTags(mind);

  // get locals
  //const tagsLocalPartial = tagsLocal.length > 0 ? { local_tag: tagsLocal } : {};

  const recordNew = {
    ...record,
    ...branchPartial,
    ...tagsRemotePartial,
    //  ...tagsLocalPartial,
  };

  return recordNew;
}

/**
 * This writes schema and git state
 * @name saveMindRecord
 * @export function
 * @param {object} record
 */
export async function saveMindRecord(api, record) {
  const mind = record.mind;

  // extract schema record with trunks from branch records
  const [schemaRecord, ...metaRecords] = extractSchemaRecords(record.branch);

  // create mind directory
  const name = Array.isArray(record.name) ? record.name[0] : record.name;

  try {
    // fails if exists
    await api.gitinit(mind, name);

    await api.csvsinit(mind);
  } catch (e) {
    if (e.message === "EEXIST") {
      console.log("repo exists, renaming");

      await api.rename(mind, name);
    } else {
      console.log(e.message);
    }
  }

  //await api.createLFS(mind);

  // write schema to mind
  await api.updateRecord(mind, schemaRecord);

  for (const metaRecord of metaRecords) {
    await api.updateRecord(mind, metaRecord);
  }

  // write remotes to .git/config
  await writeRemoteTags(api, mind, record.origin_url);

  // write locals to .git/config
  //await writeLocalTags(mind, record.local_tag);

  await api.commit(mind);

  return undefined;
}
