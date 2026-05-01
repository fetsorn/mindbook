import { sow, mow, sortNestingDescending } from "@fetsorn/csvs-js";

/**
 * This makes sure record has trunk and all trunks of trunk until root
 * @name ensureTrunk
 * @function
 * @param {object} schema -
 * @param {object} record -
 * @param {String} trunk -
 * @param {String} leaf -
 * @returns {object}
 */
export function ensureTrunk(schema, record, trunk, leaf) {
  if (!record.hasOwnProperty("_")) throw Error("record has no base");

  // if query has branch, return query
  const hasTrunk = mow(record, trunk, leaf).length > 0;

  if (hasTrunk) return record;

  // mains are trunks of trunk
  const { trunks: mains } = schema[trunk];

  // if this reaches root return query
  if (mains === undefined) return record;

  // for each main
  // ensure record has main, and sow trunk
  const withMains = mains.reduce((withMain, main) => {
    const ensured = ensureTrunk(schema, withMain, main, trunk);

    const mainValues = mow(ensured, main, trunk).map((grain) => grain[main]);

    const withMainValues = mainValues.reduce((withMainValue, mainValue) => {
      const grain = { _: main, [main]: mainValue, [trunk]: { _: trunk } };

      // now that query has trunk, sow trait
      const sown = sow(withMainValue, grain, main, trunk);

      return sown;
    }, ensured);

    return withMainValues;
  }, record);

  return withMains;
}

/**
 * This returns a csvs query from a query string
 * @name searchParamsToQuery
 * @export function
 * @param {Object} schema - mind schema.
 * @param {URLSearchParams} searchParams - search params from a query string.
 * @returns {Object}
 */
export function searchParamsToQuery(schema, searchParams) {
  // search params is a flat key-value thing
  // schema is also flat, but it describes
  // root-leaf relationships between keys
  // query is a nested object where each leaf is inside a root
  // the limit level of nesting is defined by the schema
  // walk the schema checking if a given branch has value
  // and insert the key to query with sow

  const base = searchParams.get("_");

  if (base === null) throw Error("no base in query");

  const baseValue = searchParams.get(base);

  const baseQuery =
    baseValue === null ? { _: base } : { _: base, [base]: baseValue };

  const entries = Array.from(searchParams.entries()).filter(
    ([key]) => key !== "_" && key !== "~" && key !== "-",
  );

  // sort so that trunks come first
  const sorted = entries.toSorted(([a], [b]) =>
    sortNestingDescending(schema)(a, b),
  );

  const query = sorted.reduce((withEntry, [leaf, value]) => {
    const { trunks } = schema[leaf];

    const sown = trunks.reduce((withTrunk, trunk) => {
      // check that value is nested and enrich object
      // if the entry does not have trunk yet in sow, sow it.
      // all trunk values were already sowed
      // because the entries are sorted in ascending order
      // so if this still does not have a trunk, sow the trunk
      // and the trunk of the trunk recursively until root
      const withTrunkOfLeaf = ensureTrunk(schema, withTrunk, trunk, leaf);

      const trunkValues = mow(withTrunkOfLeaf, trunk, leaf).map(
        (grain) => grain[trunk],
      );

      const withLeaf = trunkValues.reduce((withTrunkValue, trunkValue) => {
        const grain = { _: trunk, [trunk]: trunkValue, [leaf]: value };

        const withGrain = sow(withTrunkValue, grain, trunk, leaf);

        return withGrain;
      }, withTrunkOfLeaf);

      return withLeaf;
    }, withEntry);

    return sown;
  }, baseQuery);

  return query;
}

/**
 * This
 * @name changeSearchParams
 * @function
 * @param {SearchParams} searchParams -
 * @param {String} field -
 * @param {String} value -
 * @returns {SearchParams}
 */
export function changeSearchParams(searchParams, field, value) {
  // if query field is undefined, delete searchParams
  if (field === undefined) {
    return new URLSearchParams();
  } else if (field === "_") {
    // if query field is base, update default sort by
    // TODO pick default sortBy from task === "date"
    const sortBy = value;

    return new URLSearchParams(`_=${value}&.sortBy=${sortBy}`);
  } else if (field !== "") {
    // if query field is defined, update searchParams
    if (value === undefined) {
      // if query value is undefined, remove query field
      searchParams.delete(field);

      return searchParams;
    } else {
      // if query value is defined, set query field
      searchParams.set(field, value);

      return searchParams;
    }
  }

  return searchParams;
}

/**
 * This finds first available string value for sorting
 * @name findFirstSortBy
 * @function
 * @param {object} branch -
 * @param {String} value -
 * @returns {String}
 */
export function findFirstSortBy(branch, value) {
  // if array, take first item
  const car = Array.isArray(value) ? value[0] : value;

  // it object, take base field
  const key = typeof car === "object" ? car[branch] : car;

  // if undefined, return empty string
  const sortBy = key === undefined ? "" : key;

  return sortBy;
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
