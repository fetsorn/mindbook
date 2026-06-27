import { createContext, createSignal, useContext } from "solid-js";

export const SpoilerFocusContext = createContext(null);

export function Spoiler(props) {
  const onUnfold = useContext(SpoilerFocusContext);
  const [isOpen, setIsOpen] = createSignal(props.isOpenDefault);

  function open() {
    setIsOpen(true);
    onUnfold?.();
  }

  function close() {
    setIsOpen(false);
  }

  return (
    <Show
      /* when={getSpoilerOpen(props.index)} */
      when={isOpen()}
      fallback={
        <button className={`spoilerOpen spoiler-${props.title}`} onClick={open}>
          {props.title}...{" "}
        </button>
      }
    >
      <>
        <button className={`spoilerClose spoiler-${props.title}`} onClick={close}>
          {props.title}:{" "}
        </button>

        {props.children}
      </>
    </Show>
  );
}
