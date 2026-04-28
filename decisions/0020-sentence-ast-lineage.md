---
status: exploring
date: 2026-03-27
---

# Lineage and conformance of the sentence AST

## Context

ADR-0018 proposed a sentence AST as the rendering model for evenor — a pure function turns a SON record into a tree of nodes that the UI renders as interactive prose. ADR-0019 explored how edits flow back through that AST to the source record, arriving at a lens formulation. Both ADRs defined the AST in terms of rendering behavior: Inline (static text), Expandable (text with hidden depth), Overflow (truncated list). The node type names describe what the UI does with them, not what they are.

This decision asks whether the AST should conform to an existing formalism, and if so, which one. The motivation is twofold. First, naming nodes after their rendering behavior ("expandable") couples the AST's identity to one particular kind of UI. If the same AST were rendered as speech, as a terminal interface, or as a static printed page, the word "expandable" would be meaningless — but the structural relationship between the data would be the same. A satellite elaborating on a nucleus is a satellite whether it is rendered as a disclosure widget, a parenthetical in dashes, a lowered-pitch aside in speech, or a footnote in print. Second, evenor has historically been a research platform that breeds libraries. The biorg format became a panrec importer. The CSVS query engine became csvs-js and csvs-rs. If the sentence AST is to become its own library — usable by anyone who has SON records from any source — it needs a conceptual identity that does not depend on evenor's SolidJS components.

The search for a conformance target led through several domains. The conversation that produced this ADR considered and rejected linguistic grammar (subjects, predicates, adjuncts — too language-specific, a quagmire), per-schema rendering annotations (too much burden on the dataset engineer), and ad-hoc UI heuristics (the status quo, where rendering decisions are dispersed across SolidJS components). What survived was a sequence of reframings, each closer to a known formalism.

## The punctuation tree

The first reframing came from observing that evenor already assigns functions to punctuation marks: colons introduce children, ellipsis marks truncation, commas separate sibling values, dots serve as structural indicators. The interactive behaviors — touching a word to reveal more, touching "..." to show the rest of a list — are operations on punctuation. Expanding a node inserts a parenthetical delimited by paired marks (em dashes, corner brackets, parentheses depending on locale). Collapsing it removes the parenthetical. The sentence is never rewritten; only punctuation is added or removed.

Geoffrey Nunberg's "The Linguistics of Punctuation" (1990) argues that punctuation has its own grammar, separate from syntax and simpler than it. Punctuation marks are either separators (comma, semicolon — placed between things) or delimiters (parentheses, dashes, quotation marks — placed around things). This distinction maps directly to the AST: the `separator` field between phrases is a separator in Nunberg's sense, and the paired marks around an expanded node's detail are delimiters. The punctuation grammar is cross-linguistic in structure even when the specific marks differ — every writing system has separators and delimiters, even if they look different.

This framing helps because it grounds the AST in something universal about written language without importing syntactic grammar. The AST is not a parse tree of a sentence. It is a punctuation tree — a tree of text spans connected by separators and delimiters, where the delimiters can be interactively opened and closed. But "punctuation tree" describes the rendering surface, not the semantic structure.

## The speech parallel

The second reframing came from asking whether speech synthesis standards — which solve the same problem of flattening deep structure into a linear stream — have a notion of paired delimiters or parenthetical nesting.

SSML (Speech Synthesis Markup Language, W3C Recommendation) addresses how to say text: `<prosody>` changes pitch and rate, `<break>` inserts pauses, `<sub alias="...">` provides an alternate spoken form for a written string (exactly analogous to the gloss — show "ben" but the alternate representation is "who"), and `<say-as interpret-as="date">` hints at value types (parallel to the schema's task field). A speaker signals a parenthetical by dropping pitch, speeding up, and reducing volume — the listener hears the subordination and knows the main thread resumes when the voice returns to normal. The prosodic shift IS the paired delimiter, expressed as voice quality rather than punctuation marks.

But SSML does not have explicit parenthetical structure. It has styling cues that imply nesting without expressing it. The nesting is in the speaker's intent, not in the markup.

The W3C's broader vision — the Multimodal Interaction Framework (MMI Architecture, W3C Recommendation 2012) — placed a layer above SSML:

```
Semantic data (application state)
  → Interaction Manager (decides what to communicate)
  → Modality Components (render to speech via SSML, to visual via HTML, etc.)
```

Each modality component takes structured data and renders it for a specific channel. The Interaction Manager works with the application's semantic structure and does not know about any particular rendering. The sentence AST occupies exactly this position: it is the output of the Interaction Manager (what to communicate, in what structure), and the renderer is the Modality Component (how to present it visually, or auditorily, or in print).

The W3C standardized the endpoints of this pipeline — SSML for speech output, HTML for visual output, Emma (Extensible MultiModal Annotation markup language) for semantic input/output — but never standardized the intermediate representation between semantic structure and modality-specific rendering. That gap is where the sentence AST lives.

Going the other direction — from speech back to structure — the W3C has SRGS (Speech Recognition Grammar Specification) and SISR (Semantic Interpretation for Speech Recognition). SRGS defines grammars for parsing spoken utterances into structured results. SISR maps those parsed results to semantic objects. Together they form the inverse of SSML: SSML is `get` (structure → speech), SRGS+SISR is `put` (speech → structure). This is the same lens pattern from ADR-0019, appearing in a completely different domain. The parallel reinforces that the bidirectional transformation between structured data and linear human-readable output is a general problem, not specific to evenor.

## Rhetorical Structure Theory

The third reframing came from the Natural Language Generation (NLG) research community, which formalized the pipeline from structured data to text. Reiter and Dale (2000) describe three stages:

1. **Document Planning** — decide what content to include, in what order.
2. **Microplanning** — decide how to express each piece: aggregation, word choice, referring expressions.
3. **Surface Realization** — produce the actual text string with grammar and punctuation.

The `recordToSentence` function is stages 1 and 2. The renderer is stage 3. The intermediate representation between stages 2 and 3 — after the structure is decided but before the text is finalized — is what the NLG community calls a document plan or text specification. It is a tree of messages with rhetorical relations between them.

The rhetorical relations come from Rhetorical Structure Theory (RST, Mann and Thompson 1988). RST says every coherent text has a tree structure where each node is either a **nucleus** (essential, cannot be removed without breaking coherence) or a **satellite** (subordinate, can be removed and the text still makes sense). Nodes are connected by relations:

- **Elaboration** — the satellite provides more detail about the nucleus. "New York" is a nucleus; "founded 1701, population 8M" is a satellite elaborating on it. Remove the satellite and the text still reads: "...new york, los angeles, melbourne." Add the satellite and it becomes: "...new york — founded 1701, population 8M — los angeles, melbourne."
- **Sequence** — elements follow one another in a series. The list of cities is a sequence. Truncating a sequence (showing three cities, hiding seven more) is a presentational choice about how much of the sequence to display.

The AST nodes from ADR-0018 map to RST as follows:

- **Inline** is a text leaf — realized content, a nucleus that has no further internal structure.
- **Expandable** is an **elaboration** relation. The summary is the nucleus. The detail is the satellite. The satellite can be shown or hidden without breaking the surrounding text, because that is what elaboration means — the satellite is optional for coherence. This is why paired delimiters work: the text inside the delimiters is a satellite, and removing it (collapsing the node) leaves a coherent sentence.
- **Overflow** is a truncated **sequence**. The visible portion is the shown part of the sequence. The hidden portion is the continuation. Showing more of the sequence does not change the rhetorical structure — it just reveals more of the same relation.

The RST framing is better than the rendering-behavior framing because it describes what the nodes ARE, not what the UI does with them. A satellite is a satellite whether it is rendered as a collapsible inline disclosure, a footnote, a tooltip, a spoken aside at lower pitch, or a separate page linked by "read more." The rendering is a separate concern. The structure is rhetorical.

RST was used in the RAGS (Reference Architecture for Generation Systems) project, which attempted to standardize the intermediate representations in NLG pipelines. RAGS defined several data structures passed between pipeline stages, including a document structure that resembles the sentence AST — a tree of text spans with rhetorical relations marking how they connect. RAGS did not become a standard, but it demonstrated that the intermediate representation is a real and useful concept, not just an artifact of one system's architecture.

## The multimodal ambition

The author of this system describes their work as multimodal in nature, with plain text as the baseline. This aligns with the MMI Architecture's vision: the semantic structure exists independently of any modality, and different renderers produce different outputs. A SON record could be rendered as:

- Visual prose (the magic book — evenor's current target)
- Speech (via SSML, using prosodic cues for elaboration and sequence)
- A terminal interface (using indentation and ANSI colors instead of paired delimiters)
- A printed page (using footnotes or margin notes for satellites)
- A static HTML page (using `<details>/<summary>` elements)

All of these renderings would consume the same AST. The AST's structure — which parts are nuclei, which are satellites, which are sequences — is invariant across modalities. Only the surface realization changes.

This means the AST should not carry rendering hints. It should carry rhetorical structure. The renderer decides how to express elaboration (paired delimiters, footnotes, pitch drop). The renderer decides how to express sequence truncation (ellipsis, "show more" button, "and N others"). The renderer decides what the gloss looks like (toggle-on-touch, tooltip, spoken substitution). The AST just says: this is a nucleus, this is a satellite elaborating on it, this is a sequence with these elements.

## Decision drivers

- Node type names should describe the nature of the relationship, not the rendering behavior. "Nucleus" and "satellite" are stable across modalities; "expandable" and "overflow" are not.
- The AST should be expressible in terms of an existing formalism to benefit from known properties, prior research, and credibility when published as a library.
- RST is well-studied (thousands of papers since 1988), has been used in NLG systems, and has a clear mapping to the AST nodes already designed.
- The conformance should be lightweight — adopting RST's core concepts (nucleus, satellite, elaboration, sequence) without importing its full taxonomy of 23+ relation types, most of which are irrelevant to rendering structured data.
- The W3C MMI Architecture validates the overall pipeline (semantic data → intermediate representation → modality-specific rendering) without prescribing the intermediate format.
- The system should remain tractable. RST is the grounding, not the ceiling. If future needs require a relation type that RST has (e.g., contrast, condition, cause), it can be added. If RST's taxonomy proves too heavy, the system can use just the two relations (elaboration, sequence) and still call itself RST-compatible.

## Considered options

### 1. Keep rendering-behavior names (Inline, Expandable, Overflow)

Names describe what the UI does. Simple, self-documenting for frontend developers.

Breaks down when the same AST is consumed by a non-visual renderer. "Expandable" means nothing in speech synthesis. Couples the AST's identity to one rendering modality.

### 2. Adopt Portable Text (Sanity CMS)

Portable Text is a JSON specification for renderer-agnostic rich text. It has blocks and spans with marks (annotations). It is well-tooled — renderers exist for React, Vue, Svelte, and others.

Portable Text models formatting (bold, italic, links), not progressive disclosure. There is no "satellite" or "elaboration" mark type. Extending it would mean carrying Portable Text's block/span model for things the AST does not need (formatted paragraphs, headings, lists) while adding custom mark types for the things it does need. More weight than value.

### 3. Adopt HAST (unified.js ecosystem)

HAST is a direct AST representation of HTML. It is processing-oriented — you transform HAST trees with plugins and serialize to HTML. Custom node types can be defined.

HAST inherits HTML's semantics, which are visual/document-oriented. The AST would be expressed as HTML-flavored nodes, which is backwards — HTML is one possible rendering of the AST, not the AST's native language.

### 4. Adopt RST nucleus/satellite vocabulary with minimal relation set

Name the nodes after their rhetorical role. Use two relations: elaboration and sequence. Express the AST as a simplified RST tree. Keep the structure minimal (fewer node types than RST's full taxonomy) while gaining RST's conceptual clarity and research lineage.

The AST is a document plan in the NLG sense, positioned between the SON record (semantic data) and the rendered output (modality-specific surface). It conforms to the W3C MMI Architecture's intermediate layer without adopting any W3C format's specific syntax.

## Decision outcome

Chosen option: 4 — RST vocabulary with minimal relation set.

The AST node types, renamed:

```
Sentence  = { spans: Span[], separator: string }
Span      = Nucleus | Elaboration | Sequence

Nucleus      = { type: "nucleus", text: string, gloss: string | null, path: FieldPath }
Elaboration  = { type: "elaboration", nucleus: Sentence, satellite: Sentence, path: FieldPath }
Sequence     = { type: "sequence", visible: Sentence, continuation: Sentence, path: FieldPath }
```

**Nucleus** is a text leaf. It is essential content — removing it would break coherence. It carries the text value, an optional gloss (the short role hint — "who", "when", "what" — derived from the schema's task type or locale inference), and a path back to the source record for editing (per ADR-0019).

**Elaboration** is a nucleus with a satellite. The nucleus is always visible. The satellite provides additional detail and can be shown or hidden without breaking the surrounding text. In the magic book, showing the satellite means inserting it after the nucleus with locale-appropriate paired delimiters. In speech, it would be a prosodic aside. In print, it could be a footnote. The renderer decides.

**Sequence** is a series of spans that has been truncated for presentation. The visible portion renders normally. The continuation is the rest of the series, revealable on demand. This is how arrays of values are handled — many cities, many dates, many tags. The truncation point is a decision of the pure function, based on cardinality and available context. The renderer decides how to indicate that more exists (ellipsis, "show more", spoken "and others").

The separator between spans in a Sentence is determined by the pure function and may vary by locale. English defaults to a space or comma. Chinese may use a different character. The separator is a property of the Sentence, not of individual spans, because it governs the joins between spans at the same level.

## What this means for the library decomposition

The three-library decomposition from the discussion that preceded this ADR maps as follows:

**Library 1: SON manipulation** — pure functions on SON records (mow, sow, toSchema, findCrown, schema validation). This already exists inside csvs-js but operates on backend-agnostic JSON structures. Extracting it means csvs-js becomes "SON library plus CSV tablet IO."

**Library 2: SON → RST sentence** — the pure function `recordToSentence` that takes a SON record and produces the RST-based AST. Locale-swappable. No framework dependency. The RST vocabulary gives this library a conceptual identity beyond "evenor's rendering helper."

**Library 3: Sentence renderer** — framework-specific component that takes the AST and renders it. Emits edit events (per ADR-0019). Multiple renderers can exist: SolidJS for evenor, a hypothetical SSML renderer for speech, a terminal renderer, a static HTML generator. Each renderer maps RST concepts to its modality's affordances: elaboration → paired delimiters in prose, prosodic shift in speech, indentation in terminal, footnotes in print.

Evenor becomes headless: it wires CSVS storage to SON records, SON records to AST (library 2), AST to UI (library 3), and edit events back to SON records (the lens from ADR-0019). Each layer is testable and usable independently.

## Consequences

The RST vocabulary ensures that the AST describes what the content IS (nuclei and satellites in elaboration and sequence relations) rather than what the UI DOES (expand, overflow, inline). This makes the AST stable across renderers and across the project's multimodal ambition.

The conformance is lightweight. Only two of RST's 23+ relation types are used. The full RST taxonomy is available if future needs require it — for instance, a "contrast" relation could be added if the UI needs to show two conflicting values from a merge. But the minimal set (elaboration, sequence) covers the current rendering needs.

The risk is that RST is an academic framework from 1988 that never became a W3C standard or an industry format. There is no npm package for "RST document trees." Adopting the vocabulary gives conceptual clarity and a research lineage, but does not give ecosystem tooling. The library would define its own JSON format for the AST, informed by RST but not parsing or serializing any existing RST format.

## Open questions

Whether the pure function (library 2) should require the SON schema or work from the record structure alone remains unresolved (raised at the end of the discussion preceding this ADR). A function that works on any nested JSON-with-underscore-base is more general; a function that uses the schema makes better decisions about nesting order and glosses. The answer may be: the function takes an optional schema, produces reasonable output without it, and produces better output with it.

Whether "gloss" should be a property of the Nucleus node or a separate concern (a lookup table from path to gloss, maintained outside the AST) is unresolved. Putting it in the node is simpler for renderers. Putting it outside keeps the AST purely structural.

Whether additional RST relations (background, cause, condition) will ever be needed depends on what future rendering requirements emerge. The architecture allows adding them — a new Span variant, a new renderer behavior — without changing existing nodes.

The relationship between this AST and the `<details>/<summary>` HTML element is worth noting: `<details>` is a native web implementation of elaboration disclosure. The Elaboration node could be rendered as `<details>` with styling to make it inline. Whether this is accessible and usable on mobile — where the magic book must work — requires prototyping.
