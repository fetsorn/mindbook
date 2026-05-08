// =====================================================
// RHETORIC: class functions
// =====================================================
//
// Each function: meta → string[] (css classes, or empty)
//
// meta comes from two sources:
//
//   1. The SON record walk (index_builder.js). These metas
//      have depth, role, valueType, etc. They describe a
//      node in the data tree.
//
//   2. Component-local flags like { isFolded: true } or
//      { isItem: true }. These describe UI state, not
//      data structure.
//
// A class function must handle BOTH kinds of meta without
// producing garbage. The guard for this is simple: if the
// function needs a SON-walk field (depth, role, valueType),
// it checks whether that field exists. If it doesn't, the
// meta came from a UI call and the function returns [].
//
// Without this guard, rhetoric({ isFolded: true }) would
// run through order() and get rst-order-40 by default —
// pushing the fold div after the more/less button in flex
// layout. The function would answer a question nobody asked.
//
// These functions decide WHAT a node is, rhetorically.
// The theme css decides HOW that looks.
//
// To add a new css class: add a new class function.
// To understand a class: read the function's comments.
// To remove a class: delete the function.
//


// -- How deep is this node in the record tree?
//
// Depth 0 is the record's own base value.
// Depth 1 is a direct leaf — one "with..." open.
// Depth 2+ is nested — a leaf's leaf.
//
// Shallower nodes are larger — they grow UP from a
// readable floor. Depth 3+ is 1rem (browser default),
// depth 0 is the largest. This way the deepest text
// is never too small to read.
//
// Cap at 3 because beyond that everything stays at
// the floor size.
//
// Guard: depth is only set by the index walk.
// UI metas like { isFolded } have no depth — they are
// not nodes in the data tree, so nesting doesn't apply.

export function depth(meta) {
  if (meta.depth === undefined) return [];
  const level = Math.min(meta.depth, 3);
  return [`rst-depth-${level}`];
}


// -- Is this the essential content, or supporting detail?
//
// A nucleus is what you'd keep if you could only keep
// one thing from this record. "new york" is a nucleus.
// "founded 1624" is a satellite — it elaborates,
// but the sentence reads without it.
//
// In evenor, the base value (record[record._]) is always
// a nucleus. Everything under "with..." is satellite.
//
// Guard: role is only set by the index walk.
// UI metas don't participate in nucleus/satellite — they
// are not content, they are affordances around content.

export function role(meta) {
  if (meta.role === undefined) return [];

  const isNucleus = meta.role === "nucleus";
  const isSatellite = meta.role === "elaboration-satellite";

  if (isNucleus) return ["rst-nucleus"];
  if (isSatellite) return ["rst-satellite"];
  return [];
}


// -- What kind of value is this?
//
// Dates and numbers have a visual rhythm — tabular figures
// keep columns aligned and look orderly.
//
// Long text is a wall. It needs containment (truncation,
// italic, reduced opacity) so it doesn't swallow its
// neighbors.
//
// Type is inferred from the string content, not from
// schema annotations. A value that looks like a date
// is treated as a date. This keeps the function
// independent of CSVS schema terms.
//
// Guard: valueType is only set by the index walk.
// UI metas carry no content, so there's no type to infer.

export function valueType(meta) {
  if (meta.valueType === undefined) return [];

  const isDate = meta.valueType === "date";
  const isNumber = meta.valueType === "number";
  const isLongtext = meta.valueType === "longtext";

  if (isDate) return ["rst-type-date"];
  if (isNumber) return ["rst-type-number"];
  if (isLongtext) return ["rst-type-longtext"];
  return [];
}


// -- Can this node branch further?
//
// In the schema, some branches have leaves (they can
// have children) and some are twigs (terminal).
// "place" has leaves (founded, population).
// "actname" is a twig.
//
// Nodes that can branch are structurally heavier.
// They're anchors in the sentence — the reader should
// find them before the twigs.
//
// Guard: canHaveLeaves is only set by the index walk.
// UI metas are not schema nodes — they don't branch.

export function structure(meta) {
  if (meta.canHaveLeaves === undefined) return [];
  return meta.canHaveLeaves ? ["rst-has-leaves"] : ["rst-twig"];
}


// -- Where should this node appear among its siblings?
//
// Uses CSS order inside a flex container. The DOM stays
// in SON order (preserving the data path for onRecordEdit).
// Visual reordering only.
//
// Priority:
//   1. structural nodes (they anchor the sentence)
//   2. dates (temporal grounding)
//   3. numbers (quantitative detail)
//   4. short text
//   5. long text last (it's the wall)
//
// Guard: ordering only makes sense for nodes that came
// from the index walk. If a UI meta like { isFolded }
// fell through to the default case, it would get
// rst-order-40 and shift the fold div after the more/less
// button in the parent flex — answering a layout question
// that belongs to the component, not to rhetoric.

export function order(meta) {
  if (meta.valueType === undefined && meta.canHaveLeaves === undefined) return [];

  const isLongtext = meta.valueType === "longtext";
  const canBranch = meta.canHaveLeaves;
  const isDate = meta.valueType === "date";
  const isNumber = meta.valueType === "number";

  if (isLongtext) return ["rst-order-100"];
  if (canBranch) return ["rst-order-10"];
  if (isDate) return ["rst-order-20"];
  if (isNumber) return ["rst-order-30"];
  return ["rst-order-40"];
}


// -- How many children does this node have?
//
// A satellite or sequence with many children is dense.
// More breathing room prevents the elaboration from
// reading as a run-on.
//
// Guard: childCount is only set by the index walk.

export function density(meta) {
  if (meta.childCount === undefined) return [];
  const isCrowded = meta.childCount > 3;
  return isCrowded ? ["rst-many-children"] : [];
}


// -- Is this an item in a list of records?
//
// Each record in the overview list is separated from
// the next by a visual boundary. The boundary is not
// structural (it's not in the DOM hierarchy) — it's
// rhetorical: it tells the reader "this is a discrete
// entry, not a continuation of the previous one."

export function itemBorder(meta) {
  if (!meta.isItem) return [];
  return ["rst-item-border"];
}


// -- Is the item in the overview list folded or unfolded?
//
// Overview items start folded (max-height clipped).
// The fold/unfold state is a UI concern, not a data
// concern, but it affects which class applies.
// The component passes meta.isFolded.

export function fold(meta) {
  if (meta.isFolded === undefined) return [];
  return meta.isFolded ? ["rst-fold"] : ["rst-unfold"];
}


// -- Is this a clickable value/branch toggle?
//
// In the overview, each value is a button that toggles
// between showing the value ("new york") and showing
// the branch name ("place"). The underline tells the
// reader it's interactive — touchable text.

export function valueToggle(meta) {
  if (!meta.isValueToggle) return [];
  return ["rst-value-toggle"];
}


// -- Is this an editable input (profile view)?
//
// In profile mode, values become text inputs.
// The theme needs to know so it can set max-width,
// margins, responsive sizing.

export function editable(meta) {
  if (!meta.isEditing) return [];
  return ["rst-editable"];
}


// =====================================================
// INTERACTION: cross-dimensional class functions
// =====================================================
// These read multiple metadata fields. Each one is
// a specific rhetorical situation that needs its own
// visual treatment. Comments explain why the interaction
// matters — why neither dimension alone is sufficient.
//
// All interactions guard on their required fields.
// If any field is missing, the interaction doesn't apply.


// -- Long text buried deep in the tree
//
// Long text at depth 0 is the main content — show it.
// Long text at depth 2+ is a footnote inside a footnote.
// Neither "depth 2" alone nor "longtext" alone justifies
// the extra collapse — it's the combination that makes
// the surrounding sentence unreadable.

export function deepLongtext(meta) {
  if (meta.depth === undefined || meta.valueType === undefined) return [];

  const isDeep = meta.depth > 1;
  const isLongtext = meta.valueType === "longtext";

  if (isDeep && isLongtext) return ["rst-deep-longtext"];
  return [];
}


// -- The root nucleus: the record's identity
//
// Depth 0 + nucleus = the base value. This is THE thing
// the record is about. Every other value elaborates on it.
// It should be visually heavier than anything else —
// the reader's eye lands here first.
//
// Depth alone doesn't do this (satellites can also be
// at depth 0 in flat schemas). Nucleus alone doesn't
// do this (nested nuclei shouldn't be prominent).

export function prominent(meta) {
  if (meta.depth === undefined || meta.role === undefined) return [];

  const isRoot = meta.depth === 0;
  const isNucleus = meta.role === "nucleus";

  if (isRoot && isNucleus) return ["rst-prominent"];
  return [];
}


// -- A satellite with many elaboration children
//
// When a satellite itself branches into many sub-items,
// the elaboration is dense and nested. Extra spacing
// prevents it from collapsing into noise.
//
// A satellite with few children is fine with normal spacing.
// A non-satellite with many children (a sequence) has
// different rhythm — it's a list, not a nested aside.

export function crowdedSatellite(meta) {
  if (meta.role === undefined || meta.childCount === undefined) return [];

  const isSatellite = meta.role === "elaboration-satellite";
  const hasManyChildren = meta.childCount > 2;

  if (isSatellite && hasManyChildren) return ["rst-crowded-satellite"];
  return [];
}


// =====================================================
// COMPOSE
// =====================================================

const classFunctions = [
  // single-dimension
  depth,
  role,
  valueType,
  structure,
  order,
  density,
  itemBorder,
  fold,
  valueToggle,
  editable,
  // interactions
  deepLongtext,
  prominent,
  crowdedSatellite,
];

export function rhetoric(meta) {
  return classFunctions.flatMap(fn => fn(meta));
}

export default rhetoric;
