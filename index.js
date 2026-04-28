#!/usr/bin/env node

// RST sentence renderer — Library 2 + string modality component
// Takes SON records from stdin (newline-separated JSON),
// schema passed via -s flag or first line with "_": "_".
//
// Usage:
//   panrec -i store -q "_=_" > /tmp/schema.json
//   panrec -i store -q "_=event&city=volgograd" | node index.js -s /tmp/schema.json
//   # or pipe schema as first line:
//   { panrec -i store -q "_=_"; panrec -i store -q "_=event&city=volgograd"; } | node index.js

import { readFileSync } from "fs";
import { parseArgs } from "util";

// --- AST types (constructed as plain objects) ---
//
// Sentence  = { spans: Span[], separator: string }
// Span      = Nucleus | Elaboration | Sequence
//
// Nucleus      = { type: "nucleus", text: string, gloss: string | null, path: FieldPath }
// Elaboration  = { type: "elaboration", nucleus: Sentence, satellite: Sentence, path: FieldPath }
// Sequence     = { type: "sequence", visible: Sentence, continuation: Sentence, path: FieldPath }
//
// FieldPath    = PathSegment[]
// PathSegment  = { branch: string, index: number }

function nucleus(text, gloss, path) {
  return { type: "nucleus", text, gloss, path };
}

function elaboration(nuc, satellite, path) {
  return { type: "elaboration", nucleus: nuc, satellite, path };
}

function sequence(visible, continuation, path) {
  return { type: "sequence", visible, continuation, path };
}

function sentence(spans, separator = " ") {
  return { spans, separator };
}

// --- Library 2: recordToSentence ---

function recordToSentence(record, schema) {
  const base = record._;
  const baseValue = record[base];
  const path = [{ branch: base, index: 0 }];

  // Collect leaves — all keys except _ and the base key
  const leafKeys = Object.keys(record).filter(
    (k) => k !== "_" && k !== base,
  );

  // If no leaves, just a nucleus
  if (leafKeys.length === 0) {
    return sentence([nucleus(String(baseValue), base, path)]);
  }

  // Build satellite spans from leaves
  const satelliteSpans = [];
  for (const key of leafKeys) {
    const value = record[key];
    const branchPath = [...path, { branch: key, index: 0 }];

    if (Array.isArray(value)) {
      // Array of values — build spans, wrap in Sequence if >1
      const items = value.map((item, i) =>
        itemToSpan(item, key, [...path, { branch: key, index: i }], schema),
      );
      if (items.length === 0) continue;
      if (items.length === 1) {
        satelliteSpans.push(items[0]);
      } else {
        satelliteSpans.push(
          sequence(
            sentence([items[0]]),
            sentence(items.slice(1), ", "),
            branchPath,
          ),
        );
      }
    } else if (typeof value === "object" && value !== null && value._) {
      // Nested record — recurse
      satelliteSpans.push(nestedRecordToSpan(value, key, branchPath, schema));
    } else {
      // Simple string value
      satelliteSpans.push(nucleus(String(value), key, branchPath));
    }
  }

  const baseNucleus = nucleus(String(baseValue), base, path);

  if (satelliteSpans.length === 0) {
    return sentence([baseNucleus]);
  }

  return sentence([
    elaboration(
      sentence([baseNucleus]),
      sentence(satelliteSpans, ", "),
      path,
    ),
  ]);
}

function itemToSpan(item, branch, path, schema) {
  if (typeof item === "object" && item !== null && item._) {
    return nestedRecordToSpan(item, branch, path, schema);
  }
  return nucleus(String(item), branch, path);
}

function nestedRecordToSpan(record, branch, path, schema) {
  const inner = recordToSentence(record, schema);
  // The inner sentence becomes an elaboration:
  // nucleus = the nested record's base value, satellite = its children
  if (inner.spans.length === 1 && inner.spans[0].type === "elaboration") {
    // Already an elaboration from the recursive call — re-root its path
    return { ...inner.spans[0], path };
  }
  if (inner.spans.length === 1) {
    return { ...inner.spans[0], path };
  }
  // Multiple spans from recursion — wrap as elaboration with first as nucleus
  return elaboration(
    sentence([inner.spans[0]]),
    sentence(inner.spans.slice(1), inner.separator),
    path,
  );
}

// --- String modality component ---

function renderString(ast) {
  return renderSentence(ast);
}

function renderSentence(s) {
  return s.spans.map(renderSpan).filter(Boolean).join(s.separator);
}

function renderSpan(span) {
  switch (span.type) {
    case "nucleus":
      return span.text;
    case "elaboration": {
      const nuc = renderSentence(span.nucleus);
      const sat = renderSentence(span.satellite);
      if (!sat) return nuc;
      return `${nuc} \u2014 ${sat}`;
    }
    case "sequence": {
      const vis = renderSentence(span.visible);
      const cont = renderSentence(span.continuation);
      if (!cont) return vis;
      return `${vis}\u2026 ${cont}`;
    }
    default:
      return "";
  }
}

// --- CLI ---

const { values } = parseArgs({
  options: {
    schema: { type: "string", short: "s" },
  },
  strict: false,
});

const input = readFileSync("/dev/stdin", "utf-8").trim();
const lines = input.split("\n").filter(Boolean);

let schema = null;
let records = [];

if (values.schema) {
  schema = JSON.parse(readFileSync(values.schema, "utf-8"));
  records = lines.map((l) => JSON.parse(l));
} else {
  // First line with "_": "_" is schema, rest are data
  for (const line of lines) {
    const obj = JSON.parse(line);
    if (obj._ === "_") {
      schema = obj;
    } else {
      records.push(obj);
    }
  }
}

for (const record of records) {
  const ast = recordToSentence(record, schema);
  console.log(renderString(ast));
}
