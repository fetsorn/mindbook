// In-memory CRUD api for mindbook
// Used by both vite dev (index.html) and wdio browser tests

let records = [];

export function makeApi() {
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

export function reset() {
  records = [];
}

export const schema = {
  mind: {
    trunks: [],
    leaves: ["name", "category"],
    description: { en: "mind", ru: "mind" },
  },
  name: {
    trunks: ["mind"],
    leaves: [],
    description: { en: "Name of the mind", ru: "Название" },
  },
  category: {
    trunks: ["mind"],
    leaves: [],
    description: { en: "Category", ru: "Категория" },
  },
};
