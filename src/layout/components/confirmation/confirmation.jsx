import { createSignal } from "solid-js";
import { useLingui } from "@lingui/solid/macro";

export function Confirmation(props) {
  const [confirmation, setConfirmation] = createSignal(false);
  const { t } = useLingui();

  return (
    <Show
      when={confirmation()}
      fallback={
        <button
          className={"confirmationAction"}
          onClick={() => setConfirmation(true)}
        >
          {props.action}{" "}
        </button>
      }
    >
      <>
        <span className={"confirmationQuestion"}>{props.question} </span>

        <button
          className={"confirmationYes"}
          onClick={async () => {
            await props.onAction();

            setConfirmation(false);
          }}
        >
          {t`yes`}{" "}
        </button>

        <button
          className={"confirmationNo"}
          onClick={async () => {
            if (typeof props.onCancel === 'function') {
              await props.onCancel();
            }

            setConfirmation(false)
          }}
        >
          {t`no`}{" "}
        </button>
      </>
    </Show>
  );
}
