import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { Context, makeStore, onRecordEdit } from "@/store/store.js";
import { ProfileRecord } from "./profile_record.jsx";

const [store, setStore] = makeStore();

vi.mock("@/store/store.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onRecordEdit: vi.fn((context, path, value) => setStore(...path, value)),
  };
});

describe("ProfileRecord", () => {
  beforeEach(() => {
    const schemaRoot = {
      mind: {
        trunks: [],
        leaves: ["name", "branch"],
      },
      name: {
        trunks: ["mind"],
        leaves: [],
      },
      branch: {
        trunks: ["mind"],
        leaves: ["description_en"],
      },
      description_en: {
        trunks: ["branch"],
        leaves: [],
      },
    };

    setStore("schema", schemaRoot);
  });

  test("adds branch", async () => {
    const index = "index";

    const branch = "branch";

    const baseRecord = { _: "mind", mind: "mind" };

    setStore("record", baseRecord);

    onRecordEdit.mockReset();

    const { getByRole, getByText } = render(() => (
      <Context.Provider value={{ store, setStore }}>
        <ProfileRecord index={index} record={baseRecord} path={["record"]} />
      </Context.Provider>
    ));

    await userEvent.click(getByText("with..."));

    //const input = getByRole("textbox");

    //// render an input with value
    //expect(input).toHaveTextContent("id");

    await userEvent.click(getByText("add..."));

    await userEvent.click(getByText("branch"));

    expect(onRecordEdit).toHaveBeenCalledWith(
      { setStore },
      ["record", "branch"],
      [
        {
          _: "branch",
          branch: "",
        },
      ],
    );

    expect(store.record).toEqual({
      _: "mind",
      mind: "mind",
      branch: [
        {
          _: "branch",
          branch: "",
        },
      ],
    });
  });

  test("adds another branch", async () => {
    const index = "index";

    const branch = "branch";

    const baseRecord = {
      _: "mind",
      mind: "mind",
      branch: [
        {
          _: "branch",
          branch: "",
        },
      ],
    };

    setStore("record", baseRecord);

    onRecordEdit.mockReset();

    const { getByRole, getByText } = render(() => (
      <Context.Provider value={{ store, setStore }}>
        <ProfileRecord index={index} record={baseRecord} path={["record"]} />
      </Context.Provider>
    ));

    await userEvent.click(getByText("with..."));

    await userEvent.click(getByText("add..."));

    await userEvent.click(getByText("branch"));

    expect(onRecordEdit).toHaveBeenCalledWith(
      { setStore },
      ["record", "branch", 1],
      {
        _: "branch",
        branch: "",
      },
    );

    expect(store.record).toEqual({
      _: "mind",
      mind: "mind",
      branch: [
        {
          _: "branch",
          branch: "",
        },
        {
          _: "branch",
          branch: "",
        },
      ],
    });
  });

  test("adds description", async () => {
    const index = "index";

    const branch = "branch";

    const item = {
      _: "branch",
      branch: "",
    };

    const baseRecord = {
      _: "mind",
      mind: "mind",
      branch: [item],
    };

    setStore("record", baseRecord);

    onRecordEdit.mockReset();

    const { getByRole, getByText } = render(() => (
      <Context.Provider value={{ store, setStore }}>
        <ProfileRecord
          index={index}
          record={item}
          path={["record", "branch", 0]}
        />
      </Context.Provider>
    ));

    await userEvent.click(getByText("with..."));

    await userEvent.click(getByText("add..."));

    await userEvent.click(getByText("description_en"));

    expect(onRecordEdit).toHaveBeenCalledWith(
      { setStore },
      ["record", "branch", 0, "description_en"],
      [
        {
          _: "description_en",
          description_en: "",
        },
      ],
    );

    expect(store.record).toEqual({
      _: "mind",
      mind: "mind",
      branch: [
        {
          _: "branch",
          branch: "",
          description_en: [
            {
              _: "description_en",
              description_en: "",
            },
          ],
        },
      ],
    });
  });
});
