import schema from "./schema.json";
// In-memory CRUD api for mindbook
// Used by both vite dev (index.html) and wdio browser tests

let records = [];

// Pre-seed with records that exercise different rhetoric cases:
// - flat record (mind with name, category)
// - nested record (event with place that has founded/population)
// - arrays (event with multiple places)
// - long text (datum)
// - dates, numbers
// - twig values (no children)
// - branch values (have children)
const seed = [
  // flat: mind with two twig leaves
  {
    _: "mind",
    mind: "ontology",
    name: "study of being",
    category: "philosophy",
  },
  {
    _: "mind",
    mind: "rhetoric",
    name: "art of persuasion",
    category: "language",
  },
  // nested: event with one place (place has leaves)
  {
    _: "event",
    event: "walked-shore",
    actname: "ben",
    actdate: "2026-03-02",
    place: [
      {
        _: "place",
        place: "new york",
        founded: "1624",
        population: "8336817",
      },
    ],
    datum: "walked on the shore and found a small crab hiding under a rock near the tide pools",
  },
  // array: event with multiple places, some with leaves, some without
  {
    _: "event",
    event: "grand-tour",
    actname: "alice",
    actdate: "2025-07-15",
    place: [
      {
        _: "place",
        place: "new york",
        founded: "1624",
        population: "8336817",
      },
      {
        _: "place",
        place: "los angeles",
        founded: "1781",
      },
      {
        _: "place",
        place: "melbourne",
      },
      {
        _: "place",
        place: "tokyo",
        founded: "1457",
        population: "13960000",
      },
    ],
    datum: "traveled across four cities in three weeks",
  },
  // minimal: event with only a name and date, no nesting
  {
    _: "event",
    event: "sunrise",
    actname: "eve",
    actdate: "2026-01-01",
  },
  // deep nesting: event with a single place that has all leaves
  {
    _: "event",
    event: "founded-city",
    actname: "peter",
    actdate: "1703-05-27",
    place: [
      {
        _: "place",
        place: "saint petersburg",
        founded: "1703",
        population: "5384342",
      },
    ],
    datum: "laid the foundation stone for the peter and paul fortress on hare island in the neva river delta establishing what would become the capital of the russian empire for over two centuries",
  },
  // many leaves: mind with name and category both present
  {
    _: "mind",
    mind: "evenor",
    name: "magic book interface",
    category: "software",
  },
  // place has leaves but record only has the base value
  {
    _: "event",
    event: "ate bread",
    actname: "ben",
    actdate: "2022-03-02",
    place: "miami",
    datum: "with garlic",
  },
];

/**
 * Simple query string parser for the memory store mock.
 * Mirrors evenor's parseQueryString: "key:value" tokens become keyword filters,
 * bare words become freeform terms.
 */
function parseQuery(queryString, base) {
  const filters = {};
  const freeform = [];

  if (!queryString || !queryString.trim()) return { filters, freeform };

  const keywords = Object.keys(schema);
  const tokenRegex = /(\S+:"(?:[^"\\]|\\.)*"|\S+:'(?:[^'\\]|\\.)*'|\S+)/g;
  let match;

  while ((match = tokenRegex.exec(queryString)) !== null) {
    const token = match[1];
    const colonIndex = token.indexOf(":");

    if (colonIndex !== -1) {
      const key = token.slice(0, colonIndex);
      let value = token.slice(colonIndex + 1);
      value = value.replace(/^["']|["']$/g, "");

      if (keywords.includes(key)) {
        filters[key] = value;
      } else {
        freeform.push(token);
      }
    } else {
      freeform.push(token);
    }
  }

  return { filters, freeform };
}

/**
 * Check if a record matches a value by searching all string fields recursively.
 */
function matchesFreeform(record, pattern) {
  const regex = new RegExp(pattern, "i");

  for (const [key, val] of Object.entries(record)) {
    if (key === "_") continue;
    if (typeof val === "string" && regex.test(val)) return true;
    if (Array.isArray(val)) {
      for (const item of val) {
        if (typeof item === "object" && matchesFreeform(item, pattern)) return true;
      }
    }
  }

  return false;
}

/**
 * Check if a record matches a keyword filter, including nested fields.
 */
function matchesFilter(record, key, value) {
  if (record[key] !== undefined) {
    if (value === "") return true;
    if (typeof record[key] === "string") {
      return new RegExp(value, "i").test(record[key]);
    }
  }

  // search nested arrays for the key
  for (const val of Object.values(record)) {
    if (Array.isArray(val)) {
      for (const item of val) {
        if (typeof item === "object" && matchesFilter(item, key, value)) return true;
      }
    }
  }

  return false;
}

export function makeApi() {
  // start with seed data
  records = JSON.parse(JSON.stringify(seed));

  return {
    r(base, queryString) {
      const { filters, freeform } = parseQuery(queryString, base);

      const matching = records.filter((r) => {
        if (r._ !== base) return false;

        // all keyword filters must match (AND)
        for (const [key, val] of Object.entries(filters)) {
          if (!matchesFilter(r, key, val)) return false;
        }

        // freeform terms OR across all fields
        if (freeform.length > 0) {
          const pattern = freeform.join("|");
          if (!matchesFreeform(r, pattern)) return false;
        }

        return true;
      });

      return new ReadableStream({
        start(controller) {
          for (const record of matching) {
            controller.enqueue(record);
          }
          controller.close();
        },
      });
    },

    async *u(record) {
      const base = record._;
      records = records.filter(
        (r) => !(r._ === base && r[base] === record[base]),
      );
      records.push(record);
      yield record;
    },

    async *d(record) {
      const base = record._;
      records = records.filter(
        (r) => !(r._ === base && r[base] === record[base]),
      );
      yield record;
    },

    async *describe(grain) {
      const base = grain._;
      const key = grain[base];
      const found = records.find((r) => r._ === base && r[base] === key);
      if (found) yield found;
      else yield grain;
    },
  };
}

export { schema };

export function reset() {
  records = [];
}
