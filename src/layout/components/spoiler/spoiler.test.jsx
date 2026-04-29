import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore } from "@/query/store.js";
import { Spoiler } from "./spoiler.jsx";

describe("Spoiler", () => {
  test("opens", async () => {
    const index = "index";

    const title = "title";

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <Spoiler index={index} title={title} isOpenDefault={false}>
          <span>content</span>
        </Spoiler>
      </QueryContext.Provider>
    ));

    expect(() => getByText(`${title}...`)).not.toThrowError();

    const ellipsis = getByText(`${title}...`);

    await userEvent.click(ellipsis);

    expect(() => getByText(`${title}:`)).not.toThrowError();

    expect(() => getByText("content")).not.toThrowError();
  });

  test("closes", async () => {
    const index = "index";

    const title = "title";

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <Spoiler index={index} title={title} isOpenDefault={true}>
          <span>content</span>
        </Spoiler>
      </QueryContext.Provider>
    ));

    const colon = getByText(`${title}:`);

    await userEvent.click(colon);

    expect(() => getByText(`${title}...`)).not.toThrowError();

    expect(() => getByText("content")).toThrowError();
  });
});
