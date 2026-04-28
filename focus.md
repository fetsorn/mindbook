# Focus

Updated: 2026-03-28

## Arrived at

A sentence AST with three node types (Nucleus, Elaboration, Sequence) renders SON records as interactive prose. Initial implementation in index.js works but the string output is flat and undifferentiated. The base branch name and schema carry semantic weight that the renderer currently discards.

## Live edges

- Base name as classifier: "study nmnss" vs bare "nmnss". The base name frames the whole sentence. Need to find whether this has a recognized rhetorical relation in OLIA, RST-DT, or RST Treebank.
- Branch names as connectives: "block", "project", "revenue" are semantic but invisible in current output. Dataset designer should be able to supply rhetorical labels ("blocked by", "projects:") in the schema. Mapping from schema term to rhetorical device.
- Ontology survey pending: OLIA discourse module, RST Discourse Treebank, RST Treebank. Does our "classifier" exist there?
- Punctuation research: what marks exist cross-linguistically, what rhetorical functions they serve, which AST node types map to which marks in which locales. Nunberg (1990) and Lowth as starting points — curiosity threads, not necessarily part of evenor design.
- ADRs 0018, 0019, 0020 from crater to be copied here as the foundational decisions.
