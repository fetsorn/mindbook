---
status: exploring
date: 2026-03-27
---

# Sentence AST as the rendering model for evenor

## Context

Evenor renders CSVS records as interactive prose. The ambition is a "magic book" — a surface that reads like a page of text, where touching a word causes more words to appear, letting you deeper into the record without ever leaving the sentence. No field labels, no indentation, no chrome. If any of those appear, the rendering has failed.

This is not a new idea in the codebase. It evolved over roughly ten years through several forms: org-mode headings with property blocks (the biorg format), OneNote outliners modelling timelines, and eventually CSVS records projected into natural text. At each stage the data structure was a tree of typed values, and the UI tried to present that tree as something a person would want to read.

Before the natural text approach, the UI was close to ERP-style failure — a form with labeled fields whose number grew with the schema's complexity, where the user had to learn the vocabulary of trunks and leaves to understand why a field appeared where it did. The natural text rendering solved this by hiding schema terms entirely: "ben" is an actname, "walked on the shore" is a datum, "2026-03-02" is an actdate, but the user sees none of those labels. They see a sentence.

The problem is that the logic which produces this sentence is currently dispersed across SolidJS components — overview_value, overview_item_full, overview_field, spoiler, and others. Each component makes its own ad-hoc decisions about what to show inline, what to place under a spoiler, and what to cut. There is no single place where the rendering strategy is defined, and no way to vary it. A Chinese rendering of the same record would require rewriting the component tree, not swapping a function.

A specific failure case illustrates the problem. Consider a record with an array of nested objects — say, cities visited. Folded, it reads naturally: "ben walked on the shore in new york... los angeles... melbourne..." But when the user unfolds "new york", its children appear in the middle of the sentence: "ben walked on the shore in new york year founded 1701 los angeles... melbourne..." The sentence breaks because the children of "new york" are rendered at the same level as the siblings of "new york." The reader loses the thread. What was a sentence becomes a list of attributes from two different scales of detail mixed together.

This is not a problem that can be solved by adjusting CSS. Lighter text and smaller font violate accessibility requirements. Indentation and line breaks abandon the magic book constraint. The solution must be in the text itself — in the way the sentence is constructed.

## Problem statement

Evenor needs a rendering model that:

1. Takes any well-formed record and produces readable interactive prose by default, without per-schema configuration.
2. Is defined in one place as a pure function, not dispersed across UI components.
3. Can be swapped per locale without touching the UI.
4. Handles progressive disclosure (expanding nested content) without breaking the sentence around the expanded content.
5. Does not depend on CSVS schema terms — the same model should work for records fetched from SQL, HTTP, or any other source.

## Decision drivers

The rendering model must be grounded in something concrete, not in linguistic theory. As the author put it: "we need to design it so that we avoid the quagmire of linguistics and find some grounding instead." Natural language has subjects and predicates, but modelling grammatical roles would tie the system to one language's grammar and still never work reliably. The grounding must be structural, not linguistic.

The rendering must work for the common case without annotation. "That would put the weight of rendering on the dataset engineer, and we want to decouple it so that evenor does something reliable with rendering any records. There will always be records that don't render well, but that should be an edge case." Per-schema rendering hints (weights, grammatical roles, display modes) are explicitly rejected as a primary mechanism — they may exist as optional overrides later, but the default must be good without them.

CSVS itself is not the determinant feature. "You could model the same data structures in SQL with 'get records' fetching over HTTP." The rendering model must be defined in terms of the record tree, not in terms of CSVS's trunk-leaf-tablet vocabulary. This is what decouples the UI from the storage engine.

## Considered options

### 1. Status quo — rendering logic in SolidJS components

Each component reads `store.schema[branch].leaves`, `.trunks`, `.task`, `.cognate` and makes its own rendering decisions. The projection from record to text is implicit in the component tree.

This was productive for research. Each component isolates one design decision, making it possible to experiment with different rendering strategies per-element. But it means the rendering strategy is not extractable, not testable as a unit, not swappable per locale, and deeply coupled to both SolidJS and CSVS schema terms.

### 2. Per-schema rendering annotations

Add a property to each schema branch — a rendering weight, an inline/block flag, a grammatical role — so that the schema itself specifies how to render. The UI reads these annotations and follows instructions.

This shifts the burden to the dataset engineer, who must understand rendering implications when designing a schema. It also means every new schema must be annotated before it renders well, which contradicts the requirement that the common case should work without configuration.

### 3. Linguistic intermediate model

Introduce a model of grammatical roles (subject, predicate, adjunct) and map CSVS branches to roles. The renderer assembles sentences from roles using language-specific templates.

This is a quagmire. No single linguistic model covers all languages. The system would need grammatical templates per language, and the mapping from data fields to grammatical roles would itself require per-schema annotation (which field is the "subject"?). The complexity is unbounded and the common case is no better than option 2.

### 4. Sentence AST — a pure function from record to document tree

Define a small abstract syntax tree for interactive prose. A pure function takes a record and returns this AST. The UI renders the AST using locale-appropriate punctuation. The function is swappable per locale. The AST is independent of CSVS, SolidJS, and any particular natural language grammar.

## Decision outcome

Chosen option: 4 — Sentence AST.

The AST has three node types, each corresponding to one interactive behaviour the magic book needs:

```
Sentence    = { phrases: Phrase[], separator: string }
Phrase      = Inline | Expandable | Overflow

Inline      = { type: "inline", text: string }
Expandable  = { type: "expandable", summary: Sentence, detail: Sentence }
Overflow    = { type: "overflow", visible: Sentence, hidden: Sentence }
```

**Inline** is plain text. It reads as part of the sentence and is not interactive.

**Expandable** is a phrase with hidden depth. The summary is always visible. When the reader touches it, the detail is inserted immediately after the summary, wrapped in locale-appropriate paired delimiters (em dashes in English, corner brackets in Chinese, or whatever the locale function specifies). The detail itself is a Sentence, which may contain further Expandable nodes, so disclosure nests recursively.

**Overflow** is a list that is too long to show in full. The visible portion renders normally. A "..." indicator follows. When touched, the hidden portion appears. This handles arrays of values — many cities, many dates, many tags — without overwhelming the sentence.

**Separator** is a string placed between phrases in a Sentence — typically a space, but a locale might use a different character or a comma.

The pure function `recordToSentence(record, schema)` walks the record tree and makes decisions based on four properties that any record has regardless of its source: tree depth, value type (string, date, hash — inferrable from content), cardinality (single value or array), and string length. The default logic is roughly:

- Short string leaves at depth 0–1 become Inline.
- Arrays become Overflow, with the first element visible and the rest hidden.
- Values with children become Expandable, where the summary is the value itself and the detail is a recursive Sentence of the children.
- Depth alone determines what is shown at each level of disclosure. Children of a child never appear at the parent level. This is what prevents the "new york year founded 1701 los angeles" failure — when "new york" is expanded, "year founded 1701" appears inside the Expandable's detail, and the paired delimiters tell the reader it is subordinate. "Los angeles" follows the closing delimiter, resuming the parent sentence.

The UI becomes a generic AST renderer — `<SentenceRenderer ast={ast} locale={locale} />` — that knows nothing about records, schemas, or CSVS. It joins phrases with separators, renders Inline as spans, renders Expandable as touchable spans that insert delimited detail on expansion, and renders Overflow as visible spans with a "..." trigger.

The paired delimiter is the mechanism that makes progressive disclosure work in prose. English uses it constantly: "The city, which was founded in 1701, has a large port" — the commas around the relative clause are exactly what the Expandable node produces. The reader knows to skip the parenthetical and resume the main clause after the closing delimiter. This is the structural grounding that replaces linguistics: not grammatical roles, but the universal convention that paired punctuation marks a subordinate aside.

## Consequences

### What changes in evenor

The ad-hoc rendering logic in overview_value, overview_item_full, overview_field, overview_field_item, and spoiler is replaced by two things: a pure function that produces the AST, and a generic component that renders it. The existing components remain for the profile/editing view, which is a form, not prose. The sentence rendering applies to the overview — the reading surface.

`store.schema` is still needed for querying, editing, and profile rendering. But the overview no longer reads schema terms directly. It receives an AST and renders it.

### What stays the same

CSVS remains the storage and query model. The schema still defines the data structure. The dual-platform abstraction (browser/Tauri) is unaffected. The store/action/pure/impure split is unaffected. The sentence AST is a new layer between the store and the overview components, not a replacement for any existing layer.

### What this enables later

The AST is extensible. When cognate navigation is implemented, a fourth node type — Link, carrying a text and a target — can be added without restructuring. The renderer learns one new behaviour; the pure function learns one new mapping; the UI components do not change.

A Chinese locale function can reorder phrases (date before subject, for instance), use different separators, and specify different paired delimiters, without any change to the UI components or the AST definition.

Per-schema rendering hints, if ever needed, become optional overrides to the pure function's defaults — not a requirement for every new schema.

### What this does not solve

Some records will not read well as prose. A record with fifteen depth-1 fields will produce a long comma-separated sentence regardless of how clever the pure function is. The claim is not that every record reads beautifully, but that the common case — a record with a few core fields and some nested detail — reads as a sentence by default, and the failure cases are structural (too many fields, too flat a schema) rather than rendering bugs.

The function also does not generate connective words ("in", "by", "at") between fields. Doing so would require knowing the semantic relationship between fields, which is either per-schema annotation or linguistic inference — both rejected. The sentence reads as a sequence of phrases separated by punctuation, not as grammatically complete prose. This is a deliberate limitation. As the author noted, connective words "will get us too English-specific and never work anyways."
