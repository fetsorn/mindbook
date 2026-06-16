import { describe, expect, test } from "vitest";
import {
  chainTargets,
  createChainGraph,
  buildGraph,
  pickFoci,
  neighbours,
  roleOf,
} from "@/store/chain.js";

// family tree: granma <- father <- me <- son
// edges: me.parent="father", father.parent="granma", son.parent="me"
// (each record points UP to its ancestor)
const familyRecordMap = {
  granma: { _: "person", person: "granma" },
  father: { _: "person", person: "father", parent: "granma" },
  me: { _: "person", person: "me", parent: "father" },
  son: { _: "person", person: "son", parent: "me" },
};

const familyRecordSet = ["granma", "father", "me", "son"];

const buildFamily = () =>
  buildGraph(familyRecordSet, familyRecordMap, "parent");

describe("chainTargets", () => {
  test("missing record yields no targets", () => {
    expect(chainTargets(undefined, "parent")).toEqual([]);
  });

  test("absent chainBy value yields no targets", () => {
    expect(chainTargets({ _: "person", person: "granma" }, "parent")).toEqual([]);
  });

  test("scalar value yields one target", () => {
    expect(chainTargets({ parent: "father" }, "parent")).toEqual(["father"]);
  });

  test("array of scalars yields many targets", () => {
    expect(chainTargets({ parent: ["mother", "father"] }, "parent")).toEqual([
      "mother",
      "father",
    ]);
  });

  test("object values are unwrapped by chainBy key", () => {
    expect(
      chainTargets({ parent: { _: "person", parent: "father" } }, "parent"),
    ).toEqual(["father"]);
  });
});

describe("createChainGraph", () => {
  test("records edges in both directions as they are added", () => {
    const graph = createChainGraph("parent");
    graph.addRecord("me", familyRecordMap.me);
    graph.addRecord("father", familyRecordMap.father);

    expect(graph.parents.get("me")).toEqual(["father"]);
    expect(graph.children.get("father")).toEqual(["me"]);
  });

  test("addRecord is idempotent on key", () => {
    const graph = createChainGraph("parent");
    graph.addRecord("me", familyRecordMap.me);
    graph.addRecord("me", familyRecordMap.me);

    expect(graph.parents.get("me")).toEqual(["father"]);
  });

  test("incremental order does not change the result", () => {
    const a = createChainGraph("parent");
    for (const k of ["son", "me", "father", "granma"]) {
      a.addRecord(k, familyRecordMap[k]);
    }

    const b = buildFamily();

    expect(a.snapshot().component.get("son")).toBe(
      a.snapshot().component.get("granma"),
    );
    expect(a.snapshot().depthUp.get("son")).toBe(
      b.snapshot().depthUp.get("son"),
    );
  });

  test("only loaded records are present", () => {
    // granma referenced but never added
    const graph = createChainGraph("parent");
    graph.addRecord("father", familyRecordMap.father);

    expect(graph.present.has("father")).toBe(true);
    expect(graph.present.has("granma")).toBe(false);
    expect(graph.nodes.has("granma")).toBe(true);
  });
});

describe("snapshot", () => {
  test("a linear chain is one connected component", () => {
    const snap = buildFamily().snapshot();

    const roots = new Set(
      familyRecordSet.map((key) => snap.component.get(key)),
    );

    expect(roots.size).toBe(1);
  });

  test("disconnected records form separate components", () => {
    const snap = buildGraph(
      ["a", "b"],
      { a: { _: "x", x: "a" }, b: { _: "x", x: "b" } },
      "link",
    ).snapshot();

    expect(snap.component.get("a")).not.toBe(snap.component.get("b"));
  });

  test("depthUp is the longest ancestor path", () => {
    const snap = buildFamily().snapshot();

    expect(snap.depthUp.get("granma")).toBe(0);
    expect(snap.depthUp.get("son")).toBe(3);
  });

  test("depthDown is the longest descendant path", () => {
    const snap = buildFamily().snapshot();

    expect(snap.depthDown.get("granma")).toBe(3);
    expect(snap.depthDown.get("son")).toBe(0);
  });

  test("cycles stay finite", () => {
    const snap = buildGraph(
      ["a", "b"],
      { a: { _: "x", x: "a", link: "b" }, b: { _: "x", x: "b", link: "a" } },
      "link",
    ).snapshot();

    expect(Number.isFinite(snap.depthUp.get("a"))).toBe(true);
    expect(Number.isFinite(snap.depthDown.get("b"))).toBe(true);
  });
});

describe("pickFoci", () => {
  test("picks one focus per component", () => {
    const foci = pickFoci(buildFamily().snapshot());

    expect(foci.size).toBe(1);
  });

  test("prefers the middle of the lineage over the endpoints", () => {
    const foci = pickFoci(buildFamily().snapshot());

    // every spine node ties on score; balance tie-break picks
    // father (|1-2|=1) over granma and son.
    expect(foci.has("granma")).toBe(false);
    expect(foci.has("son")).toBe(false);
    expect(foci.has("father")).toBe(true);
  });

  test("off-feed targets are never chosen", () => {
    const recordSet = ["father", "me", "son"];
    const recordMap = {
      father: { _: "person", person: "father", parent: "granma" },
      me: { _: "person", person: "me", parent: "father" },
      son: { _: "person", person: "son", parent: "me" },
    };

    const foci = pickFoci(buildGraph(recordSet, recordMap, "parent").snapshot());

    expect(foci.has("granma")).toBe(false);
  });

  test("a pinned key stays focus instead of being re-picked", () => {
    const foci = pickFoci(
      buildFamily().snapshot(),
      {},
      new Set(["son"]),
    );

    expect(foci.has("son")).toBe(true);
    expect(foci.has("father")).toBe(false);
  });

  test("with no edges every record is its own focus", () => {
    const recordSet = ["a", "b", "c"];
    const recordMap = {
      a: { _: "x", x: "a" },
      b: { _: "x", x: "b" },
      c: { _: "x", x: "c" },
    };

    // chainBy null -> no edges -> flat feed of singletons
    const foci = pickFoci(buildGraph(recordSet, recordMap, null).snapshot());

    expect(foci.size).toBe(3);
  });
});

describe("neighbours", () => {
  test("causes are the records the focus points to", () => {
    expect(neighbours(buildFamily(), "me").causes).toEqual(["father"]);
  });

  test("results are through-nodes that point to the focus", () => {
    expect(neighbours(buildFamily(), "father").results).toEqual(["me"]);
  });

  test("leaf results are filtered out", () => {
    expect(neighbours(buildFamily(), "me").results).toEqual([]);
  });

  test("off-feed causes are not shown", () => {
    const recordSet = ["father", "me", "son"];
    const recordMap = {
      father: { _: "person", person: "father", parent: "granma" },
      me: { _: "person", person: "me", parent: "father" },
      son: { _: "person", person: "son", parent: "me" },
    };

    const graph = buildGraph(recordSet, recordMap, "parent");

    expect(neighbours(graph, "father").causes).toEqual([]);
  });
});

describe("roleOf", () => {
  test("the focus itself", () => {
    expect(roleOf(buildFamily(), "me", "me")).toBe("focus");
  });

  test("a cause the focus points to", () => {
    expect(roleOf(buildFamily(), "me", "father")).toBe("cause");
  });

  test("a result pointing to the focus", () => {
    expect(roleOf(buildFamily(), "me", "son")).toBe("result");
  });

  test("same component but not adjacent is hidden", () => {
    expect(roleOf(buildFamily(), "me", "granma")).toBe("hidden");
  });

  test("a different component is unchained", () => {
    const g = buildGraph(
      ["me", "father", "lonely"],
      {
        me: { _: "person", person: "me", parent: "father" },
        father: { _: "person", person: "father" },
        lonely: { _: "person", person: "lonely" },
      },
      "parent",
    );

    expect(roleOf(g, "me", "lonely")).toBe("unchained");
  });
});
