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
];

export function makeApi() {
  // start with seed data
  records = JSON.parse(JSON.stringify(seed));

  return {
    r(query) {
      const base = query._;
      const matching = records.filter((r) => {
        if (r._ !== base) return false;
        for (const [key, val] of Object.entries(query)) {
          if (key === "_") continue;
          if (r[key] === undefined) return false;
          if (!new RegExp(val).test(r[key])) return false;
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
