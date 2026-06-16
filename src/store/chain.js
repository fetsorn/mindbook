// =====================================================
// CHAIN: Loseva's chain connection of cohesion
// =====================================================
//
// Records are linked through a shared branch. A record's
// chainBy value is a directed edge pointing to another
// record: me.actname="father" means me -> father. With
// multiple targets the edges form a DAG, not a tree.
//
// The view shows ONE focus per connected component and its
// immediate neighbours (causes above, results below).
//
// The graph is a MUTABLE, INCREMENTAL structure: records are
// added one at a time as they stream in. Two tiers of read:
//
//   cheap  — neighboursOf(focus): present + edges only.
//            Run on every render; O(degree).
//   heavy  — snapshot(): connected components + longest-path
//            depths, needed only to pick foci. Run throttled.
//
// All graph state is plain Maps/Sets; nothing here touches
// the store or Solid reactivity.


// -- Normalized edge accessor
//
// A record's chainBy value can be a scalar key, an object
// { [chainBy]: key }, or an array of either. This is the
// single place that knows about those shapes.

export function chainTargets(record, chainBy) {
  if (!record) return [];

  const raw = record[chainBy];

  if (raw === undefined || raw === null) return [];

  const arr = Array.isArray(raw) ? raw : [raw];

  return arr
    .map((v) => (v && typeof v === "object" ? v[chainBy] : v))
    .filter((v) => v !== undefined && v !== null);
}


// -- Incremental DAG over chainBy edges
//
// createChainGraph(chainBy) returns a structure you feed with
// addRecord(key, record) as records arrive. Connectivity is
// maintained incrementally via union-find; depths are derived
// lazily in snapshot().

export function createChainGraph(chainBy) {
  const nodes = new Set();    // every key (records + edge targets)
  const present = new Set();  // keys that are records in the feed
                              // (added via addRecord). Edge-only
                              // targets are NOT present, so off-feed
                              // references never render as neighbours.
  const parents = new Map();  // key -> targets it points to (causes)
  const children = new Map(); // key -> keys pointing to it (results)

  // union-find for connected components, updated as edges arrive
  const uf = new Map();

  function find(x) {
    if (!uf.has(x)) uf.set(x, x);

    let root = x;
    while (uf.get(root) !== root) root = uf.get(root);

    while (uf.get(x) !== root) {
      const next = uf.get(x);
      uf.set(x, root);
      x = next;
    }

    return root;
  }

  function union(a, b) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) uf.set(ra, rb);
  }

  function push(map, key, value) {
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(value);
  }

  // Add one record. Idempotent on key, so re-streamed records
  // do not duplicate edges.
  function addRecord(key, record) {
    if (present.has(key)) return;

    nodes.add(key);
    present.add(key);
    find(key);

    for (const target of chainTargets(record, chainBy)) {
      nodes.add(target);
      push(parents, key, target);
      push(children, target, key);
      union(key, target);
    }
  }

  // Cheap: immediate neighbours of a focus, filtered to present
  // records. Results are further filtered to through-nodes (they
  // have their own incoming edges); leaf results are redundant
  // with search.
  function neighboursOf(focusKey) {
    const causes = (parents.get(focusKey) || []).filter((k) =>
      present.has(k),
    );

    const results = (children.get(focusKey) || []).filter(
      (k) => present.has(k) && (children.get(k) || []).length > 0,
    );

    return { causes, results };
  }

  // Role of a record relative to a focus.
  function roleOf(focusKey, key) {
    if (key === focusKey) return "focus";
    if ((parents.get(focusKey) || []).includes(key)) return "cause";
    if ((children.get(focusKey) || []).includes(key)) return "result";
    if (find(key) === find(focusKey)) return "hidden";
    return "unchained";
  }

  // Heavy: a derived view with components + depths, for picking
  // foci. depthUp/depthDown are longest paths along parents /
  // children (heaviest ancestors / deepest descendants).
  function snapshot() {
    const component = new Map();
    for (const node of nodes) component.set(node, find(node));

    return {
      nodes,
      present,
      parents,
      children,
      component,
      depthUp: longestPath(nodes, parents),
      depthDown: longestPath(nodes, children),
    };
  }

  return {
    chainBy,
    nodes,
    present,
    parents,
    children,
    find,
    addRecord,
    neighboursOf,
    roleOf,
    snapshot,
  };
}


// -- Build a graph from a complete recordSet in one shot
//
// Convenience for the already-loaded case. For streaming, use
// createChainGraph + addRecord directly.

export function buildGraph(recordSet, recordMap, chainBy) {
  const graph = createChainGraph(chainBy);

  // Every recordSet key is a record in the feed, so it is present
  // even if its details have not hydrated yet (recordMap[key] may
  // be undefined). Edges are read from whatever is loaded.
  for (const key of recordSet) {
    graph.addRecord(key, recordMap[key]);
  }

  return graph;
}


// -- Longest path from each node along an adjacency map
//
// Memoized DFS. A leaf has length 0. Cycles are guarded: a node
// on the current DFS stack contributes 0, so recursion stays
// finite.

function longestPath(nodes, adjacency) {
  const memo = new Map();
  const visiting = new Set();

  function go(key) {
    if (memo.has(key)) return memo.get(key);
    if (visiting.has(key)) return 0;

    visiting.add(key);

    let best = 0;
    for (const next of adjacency.get(key) || []) {
      best = Math.max(best, 1 + go(next));
    }

    visiting.delete(key);
    memo.set(key, best);

    return best;
  }

  for (const key of nodes) go(key);

  return memo;
}


// -- Immediate neighbours of a focus (delegates to the graph)

export function neighbours(graph, focusKey) {
  return graph.neighboursOf(focusKey);
}


// -- A record's role relative to a focus (delegates to the graph)

export function roleOf(graph, focusKey, key) {
  return graph.roleOf(focusKey, key);
}


// -- Pick one focus per connected component
//
// Operates on a snapshot (it needs depths + components). Within
// each component, depthUp and depthDown are normalized to the
// component's own maxima and combined by weight; ties along a
// lineage are broken toward the middle (min |up - down|), where
// the graph visibly branches out from.
//
// pinned: keys the user has explicitly centred on. A component
// containing a pinned, still-present key keeps it as focus
// instead of being re-picked — so the focus does not jump while
// more records stream in.

export function pickFoci(
  snapshot, { wUp = 0.5, wDown = 0.5 } = {}, pinned = new Set(),
) {
  const { present, depthUp, depthDown } = snapshot;

  const groups = new Map();
  for (const node of snapshot.nodes) {
    const root = snapshot.component.get(node);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(node);
  }

  const foci = new Set();

  for (const members of groups.values()) {
    const pin = members.find((k) => pinned.has(k) && present.has(k));
    if (pin) {
      foci.add(pin);
      continue;
    }

    const candidates = members.filter((k) => present.has(k));
    if (candidates.length === 0) continue;

    const maxUp = Math.max(
      1, ...candidates.map((k) => depthUp.get(k) || 0),
    );
    const maxDown = Math.max(
      1, ...candidates.map((k) => depthDown.get(k) || 0),
    );

    let best = null;
    let bestScore = -Infinity;
    let bestBalance = Infinity;

    for (const key of candidates) {
      const up = depthUp.get(key) || 0;
      const down = depthDown.get(key) || 0;

      const score = wUp * (up / maxUp) + wDown * (down / maxDown);
      const balance = Math.abs(up - down);

      if (
        score > bestScore + 1e-9 ||
        (Math.abs(score - bestScore) <= 1e-9 && balance < bestBalance)
      ) {
        bestScore = score;
        bestBalance = balance;
        best = key;
      }
    }

    if (best) foci.add(best);
  }

  return foci;
}
