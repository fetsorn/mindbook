// =====================================================
// SON value accessors
// =====================================================
//
// A SON record's branch value can be:
//   - a scalar key:    "father"
//   - an object:       { _: "person", person: "father" }
//   - an array of either: ["mother", { _: "person", person: "father" }]
//
// These functions normalize across those shapes.

/**
 * Extract the key from a single SON value (scalar or object).
 * @param {String} branch - the branch name
 * @param {*} value - scalar or object
 * @returns {String|undefined}
 */
export function sonKey(branch, value) {
  if (value === undefined || value === null) return undefined;

  if (typeof value === "object") return value[branch];

  return value;
}

/**
 * Extract all keys from a SON branch value (scalar, object, or array).
 * @param {object} record - a SON record
 * @param {String} branch - the branch name to read
 * @returns {String[]}
 */
export function sonKeys(record, branch) {
  if (!record) return [];

  const raw = record[branch];

  if (raw === undefined || raw === null) return [];

  const arr = Array.isArray(raw) ? raw : [raw];

  return arr
    .map((v) => sonKey(branch, v))
    .filter((v) => v !== undefined && v !== null);
}

/**
 * Extract the first key from a SON branch value for sorting.
 * @param {String} branch - the branch name
 * @param {*} value - the raw branch value
 * @returns {String}
 */
export function findFirstSortBy(branch, value) {
  const car = Array.isArray(value) ? value[0] : value;

  const key = sonKey(branch, car);

  return key === undefined ? "" : key;
}

export function sortCallback(sortBy, sortDirection) {
  return (a, b) => {
    const valueA = findFirstSortBy(sortBy, a[sortBy]);

    const valueB = findFirstSortBy(sortBy, b[sortBy]);

    switch (sortDirection) {
      case "first":
        return valueA.localeCompare(valueB);
      case "last":
        return valueB.localeCompare(valueA);
      default:
        return valueA.localeCompare(valueB);
    }
  };
}

/**
 * Return the @-keyed prose fields to display.
 * Edit mode: all keys, @ first, then alphabetical.
 * Read mode: best locale match only (@{locale} > @ > none).
 */
export function visibleProseKeys(record, locale, editing) {
  const allKeys = Object.keys(record ?? {}).filter((k) => k.startsWith("@"));
  if (editing) {
    return allKeys.sort((a, b) =>
      a === "@" ? -1 : b === "@" ? 1 : a.localeCompare(b),
    );
  }
  const localeKey = `@${locale}`;
  if (allKeys.includes(localeKey)) return [localeKey];
  if (allKeys.includes("@")) return ["@"];
  if (allKeys.length > 0) return [allKeys[0]];
  return [];
}

// Ensure branches with leaves are objects, not bare strings.
// If schema says "place" has leaves and the value is "new york",
// wrap it into { _: "place", place: "new york" }.
// TODO move to csvs-js
export function normalizeBranches(record, schema) {
  if (!schema || typeof record !== "object" || record === null) return record;

  for (const [key, value] of Object.entries(record)) {
    if (key === "_" || key.startsWith("@") || key === record._) continue;

    const branchSchema = schema[key];
    if (!branchSchema || branchSchema.leaves.length === 0) continue;

    if (Array.isArray(value)) {
      record[key] = value.map((item) =>
        typeof item === "string"
          ? { _: key, [key]: item }
          : normalizeBranches(item, schema),
      );
    } else if (typeof value === "string") {
      record[key] = { _: key, [key]: value };
    } else if (typeof value === "object" && value !== null) {
      normalizeBranches(value, schema);
    }
  }

  return record;
}
