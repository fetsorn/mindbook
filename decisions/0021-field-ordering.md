---
status: undecided
date: 2026-03-28
---

# Field ordering in the sentence AST

## Context

ADR-0018 introduced `recordToSentence`, a pure function that walks a SON record and produces an RST sentence AST. ADR-0020 named the nodes: Nucleus, Elaboration, Sequence. The prototype (`~/mm/codes/rst`) confirmed the pipeline works — panrec outputs SON, the pure function produces an AST, a string renderer flattens it to punctuated prose.

The prototype exposed a problem: the order in which leaf fields appear in the satellite matters for readability, and the current code uses `Object.keys()` order (JSON insertion order), which is arbitrary.

Consider the Dwarf Fortress record from folks:

```
0006eaf0... — 126-03-08, eralisan, dwarffortress, [200-line org-mode blob], 2021-02-15, fetsorn
```

The datum field is a wall of text. Everything after it — saydate, sayname — is swallowed. If the short fields came first:

```
0006eaf0... — eralisan, 126-03-08, dwarffortress, fetsorn, 2021-02-15, [200-line org-mode blob]
```

The sentence at least front-loads the identifying information before the blob. But the ordering principle is not obvious.

## Problem statement

What determines the order of spans in the satellite Sentence of an Elaboration node?

## Decision drivers

- The pure function should produce good output without per-schema annotation (ADR-0018 principle).
- CSVS schema leaf order is alphabetical (tablet sort order), not semantic.
- The SON spec does not define field order — JSON object key order is implementation-dependent.
- Long values (multiline text, org-mode blocks, prose) should not bury short identifying values.
- The ordering should be deterministic and explainable.

## Considered options

### 1. Schema leaf order

Use the order in which leaves appear in the schema record for the base. For `event` in the folks store: `actdate, actname, category, file, datum, privacy, saydate, sayname`.

Pro: deterministic, derived from existing data, no new annotation.
Con: alphabetical by accident of CSV sort order. No semantic intent.

### 2. Short values before long values

Sort satellite spans by the string length of their text content, ascending. Short identifying values (names, dates, tags) cluster first. Long blobs sink to the end.

Pro: works without any schema change. Front-loads the information that fits in a sentence. The pure function already has access to the values.
Con: unstable — adding a character to a value can change its position relative to neighbors of similar length. Not explainable to a user ("why did this field move?"). Conflates "short" with "important."

### 3. Schema annotation — explicit display order

Add an ordering hint to the schema. For example, a `branch-weight.csv` tablet or an ordered list in the schema record. The pure function reads the order and uses it.

Pro: semantic intent expressed by the dataset engineer. Stable. Explainable.
Con: contradicts ADR-0018's principle that the common case should work without per-schema configuration. Every new schema must be annotated. Adds a new convention to CSVS.

### 4. Trunk-depth heuristic

Fields whose branches are trunks of other branches (i.e., they have children in the schema) are "structural" and go first. Fields that are pure leaves (no children) go after. Within each group, alphabetical or insertion order.

Pro: derived from schema structure, no new annotation. Branches with children are more likely to be identifying (e.g., `actname` as a potential trunk) while pure leaves are more likely to be metadata.
Con: in a flat schema where nothing has children, this provides no ordering at all. Only useful once schemas gain more nesting.

### 5. Convention: field order in schema record is semantic

Declare that the order of fields in the `_-_.csv` schema tablet is not merely alphabetical but meaningful — first-listed leaves are more prominent. The dataset engineer controls ordering by arranging lines in the schema tablet.

Pro: no new tablet or annotation format. Uses existing structure. The dataset engineer already writes the schema.
Con: CSVS tablets are sorted CSV files — reordering lines may conflict with the sort invariant. Would need a spec amendment or a separate "display order" that overrides sort order. Fragile under tooling that re-sorts tablets.

## Open questions

- Is there a sixth option that uses the record's own structure (e.g., which fields are populated, which are empty) rather than the schema?
- Should the ordering be a concern of Library 2 (the pure function) or Library 3 (the renderer)? The renderer might want different orderings for different modalities — a speech renderer might put the date first for temporal grounding, while a visual renderer puts the name first.
- Does the datum problem go away once datum is offloaded to sidecar markdown (as planned)? If so, the ordering question becomes less urgent — all remaining fields would be short.
