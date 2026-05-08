// =====================================================
// INDEX BUILDER
// =====================================================
//
// Walks a SON record and schema, produces a Map of
// metadata about each node, keyed by lens path.
//
// The lens path is the SolidJS store path that
// onRecordEdit already uses: ["record", "place", 0, "founded"]
// We join it with "." for the map key.
//
// This is a materialized view of the record. It does not
// modify the record. It does not live in the store.
// It is recomputed when the record changes.
//
// The output is the input to rhetoric().
//


// -- Path key
//
// SON arrays can have identical string elements.
// Content-addressing won't work. The lens path
// (position in the tree) is the identity.

export function pathToKey(path) {
  return path.join(".");
}


// -- Type inference from string content
//
// We don't look at schema annotations (task, cognate).
// A value that looks like a date is a date.
// This keeps the function independent of CSVS.

export function inferType(value) {
  if (typeof value !== "string") return "object";
  if (/^\d{4}(-\d{2}){0,2}$/.test(value)) return "date";
  if (/^\d+$/.test(value)) return "number";
  if (value.length > 80) return "longtext";
  return "text";
}


// -- The metadata object
//
// This is what rhetoric() receives. Every field here
// is something a class function might want to read.
//
// {
//   path:          string[]   — lens path segments
//   depth:         number     — nesting level (0 = root)
//   role:          string     — "nucleus" | "elaboration-satellite" | "sequence"
//   value:         string|null
//   valueType:     string     — "text" | "date" | "number" | "longtext" | "array" | "object"
//   valueLength:   number
//   hasLeaves:     boolean    — does this node actually have children in the record?
//   canHaveLeaves: boolean    — could it have children according to the schema?
//   childCount:    number     — how many children (array length or leaf count)
//   siblingIndex:  number     — position among siblings
//   siblingCount:  number     — total siblings
// }


// -- Walk

export function buildIndex(record, schema, path, depth, siblingIndex, siblingCount, index) {
  path = path || [];
  depth = depth || 0;
  siblingIndex = siblingIndex || 0;
  siblingCount = siblingCount || 1;
  index = index || new Map();

  if (record === undefined || record === null) return index;


  // --- terminal string value ---
  //
  // A string is always a nucleus. It's the actual content
  // the reader sees. The last segment of the path is
  // the branch name.

  if (typeof record === "string") {
    const branch = path[path.length - 1];
    const branchSchema = schema[branch];
    const canHaveLeaves = branchSchema
      ? branchSchema.leaves.length > 0
      : false;

    index.set(pathToKey(path), {
      path: [...path],
      depth,
      role: "nucleus",
      value: record,
      valueType: inferType(record),
      valueLength: record.length,
      hasLeaves: false,
      canHaveLeaves,
      childCount: 0,
      siblingIndex,
      siblingCount,
    });

    return index;
  }


  // --- array: a sequence ---
  //
  // First element is visible, rest are under "and...".
  // Each element gets the same depth as the array itself
  // because the array is not a nesting level — it's
  // multiple values at the same level.

  if (Array.isArray(record)) {
    index.set(pathToKey(path), {
      path: [...path],
      depth,
      role: "sequence",
      value: null,
      valueType: "array",
      valueLength: 0,
      hasLeaves: false,
      canHaveLeaves: false,
      childCount: record.length,
      siblingIndex,
      siblingCount,
    });

    record.forEach((item, i) => {
      buildIndex(
        item, schema,
        [...path, i],
        depth,
        i, record.length,
        index,
      );
    });

    return index;
  }


  // --- SON record: elaboration ---
  //
  // A record has a base value (the nucleus) and leaves
  // (the satellite). The base value is at the same depth
  // as the record. The leaves are one level deeper.

  if (typeof record === "object" && record._ !== undefined) {
    const base = record._;
    const baseValue = record[base];
    const baseSchema = schema[base];
    const leaves = baseSchema ? baseSchema.leaves : [];
    const presentLeaves = leaves.filter(l => record.hasOwnProperty(l));


    // -- record container: the OverviewRecord span
    //
    // The span that wraps the nucleus + "with..." spoiler
    // needs a depth class so that spoiler buttons (which
    // have no rhetoric of their own) inherit the right
    // font-size. Without this, "with:" after "event"
    // would fall to browser default 1rem while "with:"
    // after "new york" inherits 1.08rem from its parent.

    index.set(pathToKey(path), {
      path: [...path],
      depth,
      role: "elaboration-satellite",
      value: null,
      valueType: "object",
      valueLength: 0,
      hasLeaves: presentLeaves.length > 0,
      canHaveLeaves: leaves.length > 0,
      childCount: presentLeaves.length,
      siblingIndex,
      siblingCount,
    });


    // -- nucleus: the base value

    if (typeof baseValue === "string") {
      index.set(pathToKey([...path, base]), {
        path: [...path, base],
        depth,
        role: "nucleus",
        value: baseValue,
        valueType: inferType(baseValue),
        valueLength: baseValue.length,
        hasLeaves: presentLeaves.length > 0,
        canHaveLeaves: leaves.length > 0,
        childCount: 0,
        siblingIndex,
        siblingCount,
      });
    }


    // -- satellite children: each leaf present in the record

    presentLeaves.forEach((leaf, leafIndex) => {
      const leafValue = record[leaf];
      const leafPath = [...path, leaf];
      const leafSchema = schema[leaf];
      const isArray = Array.isArray(leafValue);
      const isString = typeof leafValue === "string";
      const stringValue = isString ? leafValue : "";
      const leafCanHaveLeaves = leafSchema
        ? leafSchema.leaves.length > 0
        : false;

      // Schema task overrides content inference.
      // A field with task:"text" is always longtext
      // regardless of how short the string is.
      // This keeps same-schema fields visually consistent.
      const schemaTask = leafSchema?.task;
      const inferredType = isArray ? "array" : inferType(stringValue || "");
      const leafType = schemaTask === "text" ? "longtext" : inferredType;

      index.set(pathToKey(leafPath), {
        path: leafPath,
        depth: depth + 1,
        role: "elaboration-satellite",
        value: isString ? leafValue : null,
        valueType: leafType,
        valueLength: stringValue.length,
        hasLeaves: leafCanHaveLeaves,
        canHaveLeaves: leafCanHaveLeaves,
        childCount: isArray ? leafValue.length : 0,
        siblingIndex: leafIndex,
        siblingCount: presentLeaves.length,
      });


      // String leaves get an alias at [...leafPath, 0].
      // OverviewField always wraps values in arrays, so
      // OverviewValue looks up ["datum", 0] not ["datum"].
      // The alias makes both paths find the same metadata.
      // We don't recurse into strings — the satellite entry
      // above is canonical. Recursing would overwrite it
      // with a "nucleus" role and lose schema-aware valueType.

      if (isString) {
        const meta = index.get(pathToKey(leafPath));
        index.set(pathToKey([...leafPath, 0]), meta);
      }

      if (!isString) buildIndex(
        leafValue, schema,
        leafPath,
        depth + 1,
        leafIndex, presentLeaves.length,
        index,
      );
    });
  }

  return index;
}

export default buildIndex;
