import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { I18nProvider } from "@lingui/solid";
import { i18n } from "@/i18n.js";
import { Confirmation } from "./confirmation.jsx";

describe("Confirmation", () => {
  test("no", async () => {
    const action = "action";

    const question = "question?";

    const onAction = vi.fn();

    const onCancel = vi.fn();

    const { getByText } = render(() => (
      <I18nProvider i18n={i18n}>
        <Confirmation
          action={action}
          question={question}
          onAction={onAction}
          onCancel={onCancel}
        />
      </I18nProvider>
    ));

    // find remove
    const command = getByText(action);

    // click remove
    await userEvent.click(command);

    // find no
    const no = getByText(/no/i);

    // click no
    await userEvent.click(no);

    // check that action did not work
    expect(onAction).not.toHaveBeenCalled();

    expect(onCancel).toHaveBeenCalled();

    // check that action shows again
    expect(() => getByText(action)).not.toThrowError();
  });

  test("yes", async () => {
    const action = "action";

    const question = "question?";

    const onAction = vi.fn();

    const { getByText } = render(() => (
      <I18nProvider i18n={i18n}>
        <Confirmation action={action} question={question} onAction={onAction} />
      </I18nProvider>
    ));

    // find remove
    const command = getByText(action);

    // click remove
    await userEvent.click(command);

    // find yes
    const yes = getByText(/yes/i);

    // click yes
    await userEvent.click(yes);

    // check that action worked
    expect(onAction).toHaveBeenCalledWith();
  });
});
