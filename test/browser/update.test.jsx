import { setup, cleanup } from "./setup.js";
import { createMind, edit, setValue, save } from "./actions.js";

describe("update", () => {
  before(async () => {
    await setup();
  });

  it("should update a record", async () => {
    await createMind("foobar");

    await edit();

    await setValue(await $("aria/Name of the mind -"), "foobaz");

    await save();

    const element = await $("aria/foobaz");
    await expect(element).toBeDisplayed();
  });

  afterEach(async () => {
    await cleanup();
  });
});
