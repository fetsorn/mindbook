---
status: exploring
date: 2026-03-27
---

# Editing through the sentence AST — lenses, paths, and the record as source of truth

## Context

ADR-0018 introduced a sentence AST as the intermediate model between data records and the evenor UI. A pure function `recordToSentence` projects any record into a tree of Inline, Expandable, and Overflow nodes, and two renderers display this tree: the overview (a read-only magic book) and the profile (an editable form). The ADR left editing unspecified. This decision addresses how edits in the profile flow back through the AST to the underlying record and eventually to CSVS storage.

The question is not merely "how does the save button work" — evenor already has a save flow that diffs old and new records and issues CSVS insert/update/delete operations at the grain level. The question is how the sentence AST participates in that flow. Specifically: when a user changes "ben" to "alice" in a profile input field, what mechanism connects that input field to the right location in the record? And when the user clicks "Add..." to append a new city to an array, what mechanism ensures the new empty value appears at the right position?

The complication that prompted this ADR: if the profile renderer naively re-derives the AST from the record on every change, SolidJS components lose focus. The user types a character, the record updates, the AST re-derives, the component tree re-renders, and the input field that was focused is replaced by a new input field in the same position. The cursor jumps or disappears. This is a known problem in reactive frameworks when the view is a pure derivation of the model — any model change destroys view state (focus, selection, scroll position) unless the framework can identify which DOM nodes are "the same" across re-renders.

## The view update problem

What we are dealing with has a name in database theory: the view update problem. Given a base table (the record) and a view defined by a query (the AST, derived by `recordToSentence`), the question is whether updates on the view can be unambiguously translated to updates on the base table.

The classic result (Bancilhon and Spyratos, 1981) is that view updates are only unambiguous when the view mapping has a complement — enough extra information to uniquely reconstruct which base update corresponds to a given view update. Without a complement, a single view change could correspond to multiple different base changes, and the system must guess.

In our case, the complement is the **path**: each AST node carries information about where in the record its value came from. With the path, the mapping from "user changed this AST node" to "update this record field" is deterministic. Without the path, the system would have to infer which record field corresponds to the edited AST node, which is ambiguous in cases like an array `[ben, ben, ben]` where three nodes have the same text but different source positions.

## Lenses

The functional programming community formalizes this as a **lens**. A lens is a pair of functions:

```
get : Source → View
put : Source → View → Source
```

In our case:

```
get = recordToSentence : Record → AST
put = applyASTEdits    : Record → AST → Record
```

The lens laws provide a correctness contract:

**GetPut**: `put(s, get(s)) = s` — if you derive the AST from a record and immediately put it back without changes, you get the same record. This means the roundtrip is lossless for the identity edit.

**PutGet**: `get(put(s, v)) = v` — if you put a modified AST back into the record and re-derive, you get the modified AST. This means the edit actually took effect and is visible in the re-derived view.

These laws are directly testable as property-based tests: generate random records, project to AST, apply random value changes to AST nodes via their paths, put back, verify the laws hold. This connects to the testing review's recommendation for property-based tests on mow/sow roundtrips, and extends it to the rendering layer.

The lens formulation comes from the Haskell community, where libraries like `lens` (van Laarhoven) and `optics` provide composable accessors. The connection to this design is that the sentence AST lens is built compositionally: a lens for Inline nodes (trivial — read and write the text at the path), a lens for Expandable nodes (recursive — apply the lens to summary and detail), a lens for Overflow nodes (lens on visible, lens on hidden, with index tracking position). Each node type's lens is simple; the composition handles the tree structure.

The Boomerang language (Foster, Greenwald, Moore, Pierce, Schmitt — the same Pierce who wrote Types and Programming Languages) takes this further with bidirectional string transformations defined as lens combinators, where the laws are checked compositionally. This is perhaps the most directly relevant academic work, though Boomerang operates on strings rather than trees.

## Why patches matter, and where they apply

The author of this system has experience with pijul and its patch theory, which is based on Mimram and Di Giusto's categorical treatment of patches. In patch theory, edits are morphisms between states, composition of patches is functorial, patches commute when they touch different parts of the structure, and patches conflict when they touch the same part. "Same part" is defined by position, not by content — which directly addresses the `[ben, ben, ben]` problem. Changing the first ben and changing the third ben are independent patches that commute. Changing the first ben twice is a conflict.

However, in the current evenor edit flow, patch theory applies at the CSVS layer, not the AST layer. The reason: the user edits a record in the profile, clicks save, and the entire modified record is passed to `updateRecord`. CSVS then breaks the old and new records into grains (via `mow`), diffs the grain sets, and writes the changes to tablets. The grain-level diff is where patch commutativity and conflict detection matter — particularly when two devices edit the same record and sync via git. The git merge operates on the CSV tablet files, and whether it succeeds depends on whether the grain-level changes touch different lines.

The AST layer does not need its own patch algebra because the AST is never the target of persistent mutation. It is re-derived from the record on each change. Edits flow through the record, not through the AST. The AST is a lens, not a document.

This was a deliberate choice. Extending the magic book metaphor to "touch the sentence and watch it grow" — where the user edits the prose directly and the system parses it back into structured data — would require parsing natural language into record structure, which is a CRDT and parsing problem with unbounded complexity. Instead, all structural edits (adding a field, removing an array element) are performed through explicit UI affordances ("Add..." buttons, "cut" confirmations) that operate on the record directly. The sentence re-derives to reflect the change. The magic book is for reading; the profile is for writing.

## The edit flow in detail

### Value edits (changing "ben" to "alice")

1. The user opens a record in the profile view.
2. `recordToSentence(record, schema)` derives the AST. Each Inline node carries a path — e.g., `{ branch: "actname", index: 0 }` for the first value of the actname field.
3. The profile renderer creates an input field for each Inline node. The input's value is the node's text. The input's identity (for SolidJS keying and focus preservation) is derived from the node's path.
4. The user types "alice" over "ben."
5. The profile renderer writes "alice" to the record at the path `{ branch: "actname", index: 0 }`. This is a direct mutation of the record copy held by the store, not a re-derivation of the AST.
6. SolidJS reactivity detects the record change. The AST re-derives. Because the path is stable (the actname field at index 0 still exists and still maps to the same input), SolidJS can reconcile the DOM — the input field keeps focus.
7. The user clicks save. The modified record is passed to `saveRecord`, which diffs old vs. new, calls CSVS `updateRecord` / `insertRecord` / `deleteRecord` as needed, commits, and resolves.

### Structural edits (adding a city)

1. The user clicks "Add..." next to the cities field in the profile.
2. The profile renderer appends an empty string to the cities array in the record at the appropriate path.
3. The AST re-derives. The Overflow node for cities now has one more phrase. The profile renderer creates a new empty input field for it.
4. The user types "melbourne" into the new input.
5. On save, the diff detects a new grain (the city "melbourne") and issues a CSVS insert.

### Structural edits (removing a city)

1. The user clicks "cut" next to "los angeles" in the profile.
2. The profile renderer removes the element at the corresponding index from the cities array in the record.
3. The AST re-derives. The Overflow node has one fewer phrase. All subsequent paths shift their indices down by one.
4. On save, the diff detects a missing grain and issues a CSVS delete.

## The focus preservation problem

The complication that makes this non-trivial: SolidJS (like React, Svelte, and other reactive frameworks) reconciles the DOM by matching old and new virtual DOM nodes. If the AST is re-derived from scratch on every keystroke, the framework sees a new tree and must decide which nodes are "the same" as before. If it guesses wrong, it destroys and recreates DOM elements, losing focus.

The standard solution is **keying**: each rendered element carries a stable key that the framework uses for reconciliation. The AST path is a natural key — `{ branch: "actname", index: 0 }` is stable across value edits (changing "ben" to "alice" doesn't change the path) and only shifts during structural edits (deleting an earlier element shifts subsequent indices).

But there is a subtlety. SolidJS uses fine-grained reactivity, not virtual DOM diffing. If the record is a SolidJS store (created with `createStore`), and the AST derivation reads specific store paths, then a change to `record.actname[0]` will only trigger re-derivation of the AST node that reads that path — not the entire AST. The other nodes, and their DOM elements, are untouched. Focus is preserved not by keying but by granular reactivity: only the changed node re-renders.

This means the AST derivation function should be written to cooperate with SolidJS's tracking. Rather than a single `recordToSentence` call that reads the entire record and produces a new AST, the derivation should be structured so that each AST node's text is a reactive derivation of the corresponding record path. When `record.actname[0]` changes, only the Inline node for actname-0 recomputes its text. The tree structure of the AST only changes on structural edits (add/remove), which are less frequent and where a full re-derive is acceptable.

This is an implementation detail, but it constrains the AST design: the pure function `recordToSentence` must be decomposable into per-node reactive computations. This is feasible because each node depends on a specific record path, and the path is known at derivation time. But it means the "pure function" is really a "pure function that produces a reactive tree," which is a subtlety worth noting.

An alternative approach, if the reactive decomposition proves too complex, is to accept full re-derivation on each change and use SolidJS `<Index>` (which keys by position) or `<For>` (which keys by reference) to preserve DOM identity. The AST nodes would need stable references or positional keys derived from their paths. This is the less elegant solution but it is well-understood in the SolidJS community.

## The path structure

A path identifies a location in the record tree. The simplest representation:

```
type FieldPath = PathSegment[]
type PathSegment = { branch: string, index: number }
```

For a flat record `{ _: "event", actname: "ben", datum: "walked" }`, the path to "ben" is `[{ branch: "actname", index: 0 }]`.

For a nested record `{ _: "event", actname: "ben", place: [{ _: "place", place: "new york", founded: "1701" }] }`, the path to "1701" is `[{ branch: "place", index: 0 }, { branch: "founded", index: 0 }]`.

The index is necessary because arrays have positional identity. The `[ben, ben, ben]` case: the first ben is `[{ branch: "actname", index: 0 }]`, the second is `[{ branch: "actname", index: 1 }]`, the third is `[{ branch: "actname", index: 2 }]`. The values are identical; the paths are distinct.

The path is computed by `recordToSentence` during derivation. It does not require any new data in the record or schema — it is implicit in the tree traversal. When the function encounters an array, it enumerates elements with their indices. When it recurses into a nested record, it appends a segment to the path. The path grows as derivation descends.

## Relationship to the Elm architecture and functional reactive programming

The author of this system worked with Elm in the past, and the edit flow described here follows the Elm architecture closely:

```
Model  = Record (the CSVS-backed data)
View   = AST (derived by recordToSentence)
Message = Edit event (SetText path value, InsertAt path, RemoveAt path)
Update = Apply edit to record (direct mutation of store)
```

The view is a pure function of the model. User interactions produce messages. The update function applies messages to the model. The view re-derives. The view never mutates — it is always a projection.

The edit events form a small language:

- `SetText(path, newValue)` — change the text of a leaf value
- `InsertAt(path, emptyValue)` — add a new element to an array
- `RemoveAt(path)` — remove an element from an array

This is the "edit language" that translates between AST interactions and record mutations. It is intentionally minimal. The three operations correspond to the three things a user can do in the profile: type in an input, click "Add...", click "cut."

The parallel to Datomic is worth noting for historical context: Datomic treats the database as an immutable log of assertions and retractions, each tagged with a transaction ID. Every edit is a transaction that retracts old facts and asserts new ones. The database at any point is the reduction of all transactions. CSVS has a similar character — grains are asserted into tablets, and `updateRecord` computes the minimal set of grain assertions and retractions needed to move from the old record to the new one. The transaction is the git commit. The difference is that CSVS stores the current state in sorted CSV files rather than an append-only log, so the "log" is the git history rather than the primary storage.

## What this means for the AST node types

ADR-0018 defined:

```
Inline      = { type: "inline", text: string }
Expandable  = { type: "expandable", summary: Sentence, detail: Sentence }
Overflow    = { type: "overflow", visible: Sentence, hidden: Sentence }
```

With editing, each node that can be a source of user input needs a path. In practice this means Inline nodes, since they carry the text values that the user edits. Expandable and Overflow nodes are structural — they organize other nodes — and their editability is indirect (the user edits the Inline nodes inside them, or uses "Add..."/"cut" buttons whose operations are record-level, mapped by the parent's path).

```
Inline      = { type: "inline", text: string, gloss: string | null, path: FieldPath }
Expandable  = { type: "expandable", summary: Sentence, detail: Sentence, path: FieldPath }
Overflow    = { type: "overflow", visible: Sentence, hidden: Sentence, path: FieldPath }
```

ADR-0018 also discussed a `gloss` field — a short human-readable role hint for each value, used by the profile renderer as a field label and by the overview renderer as a toggle-on-touch explanation. The gloss is generated by the pure function based on the schema's task type or a locale-specific inference: task "date" glosses as "when," task "text" glosses as "what," and so on. This addresses the complication that branch names like "actname" are not always meaningful to end users, and the full i18n descriptions are too long to inline.

Expandable and Overflow carry paths for the "Add..." and "cut" affordances: the profile renderer needs to know which record location to insert into or remove from when the user clicks a structural edit button adjacent to an Expandable's detail or an Overflow's list.

## Consequences

### What changes in evenor

The existing profile components (ProfileRecord, ProfileField, ProfileFieldItem, ProfileValue) currently read `store.schema` directly to determine field names, nesting, and editability. Under this design they would instead receive AST nodes and render them as editable inputs keyed by path. The "save" flow stays the same — the modified record is passed to `saveRecord`, which diffs and calls CSVS operations.

The gloss field replaces the current pattern where clicking a value toggles the branch name. Instead of showing "actname" (the system's vocabulary), the overview shows the gloss ("who") on touch. The profile shows the gloss as the input label. This is more meaningful to end users and does not require them to learn CSVS terminology.

### What stays the same

The record is the source of truth. The AST is always derived, never persisted. CSVS grain-level diff on save is unchanged. The git-based sync and conflict resolution layer is unchanged. The dual-platform abstraction (browser/Tauri) is unaffected — the AST and its renderers are pure frontend concerns.

### What this enables later

The lens laws are testable as property-based tests, which addresses the testing review's gap around mow/sow correctness and gives a formal contract for the rendering layer.

Patch theory from pijul applies at the CSVS grain layer: each `updateRecord` call produces a set of grain insertions and deletions, which are patches. Commutativity and conflict detection at this layer would enable better merge semantics than git's default text merge on CSV files. This is a separate concern from the AST but the same theoretical framework.

If collaborative editing is ever desired, the edit event language (SetText, InsertAt, RemoveAt) is a starting point for operational transformation or CRDT-based collaboration. But this is explicitly out of scope — the current design is single-writer with git-based sync, and the magic book is read-only. The profile is a personal editing surface, not a shared document.

## Open questions

The reactive decomposition of `recordToSentence` — whether it can be structured so that SolidJS tracks per-node dependencies rather than re-deriving the entire AST — needs prototyping. The alternative (full re-derivation with positional keying) is simpler but may produce focus jitter on fast typing.

The gloss inference (mapping task types to short role words) is locale-dependent and will not always be meaningful. A fallback — showing the branch name when no gloss is available — may be necessary, which brings back the problem of branch names not being user-facing vocabulary. This may push toward requiring a gloss field in the schema, which contradicts the "no per-schema annotation" principle from ADR-0018. The tension is real and unresolved.

The path structure assumes array indices are stable within an editing session. But if two array elements are deleted in sequence, the second deletion's path must account for the first deletion's index shift. The profile renderer must either re-derive paths after each structural edit or use a stable identity scheme (UUIDs per array element). The choice affects complexity and connects to the same index-shift arithmetic that patch theory addresses.
