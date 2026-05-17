import { setup, cleanup } from "./setup.js";
import { setValue, createMind, search } from "./actions.js";

describe("search", () => {
  before(async () => {
    await setup();
  });

  it("should search for a record", async () => {
    await createMind("foobar");

    await setValue(await $("aria/query"), "philosophy");

    await search();

    const element = await $("aria/found");
    await expect(element).toHaveText("found 1");
  });

  afterEach(async () => {
    await cleanup();
  });
});
