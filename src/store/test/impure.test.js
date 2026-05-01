import { describe, expect, test, vi } from "vitest";
import { createRecord } from "@/store/impure.js";
import { newUUID } from "@/store/record.js";
import stub from "./stub.js";

vi.mock("@/store/record.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    newUUID: vi.fn(),
  };
});

describe("createRecord", () => {
  newUUID.mockImplementation(() => stub.id);

  test("root", async () => {
    const template = { location: "town" };

    const record = await createRecord("root", "mind", template);

    expect(record).toStrictEqual({
      _: "mind",
      mind: stub.id,
      ...template,
    });
  });

  test("id", async () => {
    const record = await createRecord(stub.id, stub.trunk, {});

    expect(record).toStrictEqual({ _: stub.trunk, [stub.trunk]: stub.id });
  });
});
