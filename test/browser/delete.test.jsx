import { setup, cleanup } from "./setup.js";
import { createMind, wipe } from "./actions.js";

describe("delete", () => {
  before(async () => {
    await setup();
  });

  it("should delete a record", async () => {
    await createMind("foobar");

    await wipe();

    const element = await $("aria/found");
    await expect(element).toHaveText("found 0");
  });

  afterEach(async () => {
    await cleanup();
  });
});
