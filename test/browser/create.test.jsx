import { setup, cleanup } from "./setup.js";
import { createMind } from "./actions.js";

describe("create", () => {
  before(async () => {
    await setup();
  });

  it("should create a record", async () => {
    await createMind("foobar");

    const element = await $("aria/found");
    await expect(element).toHaveText("found 1");
  });

  afterEach(async () => {
    await cleanup();
  });
});
