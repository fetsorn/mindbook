import { createElementSize } from "@solid-primitives/resize-observer";
import { createSignal, createEffect } from "solid-js";
import { rhetoric } from "@/style/rhetoric.js";
import { Confirmation, Spoiler } from "@/layout/components/index.js";
import { OverviewValue } from "../index.js";
import styles from "./overview_item_light.module.css";

// A light preview of an item: its base value plus one action
// button supplied by the caller. The component does not know what
// the action means (load, recenter, ...) — onSelect + actionLabel
// are passed in.
export function OverviewItemLight(props) {
  const [content, setContent] = createSignal();

  const [showActions, setShowActions] = createSignal(false);

  const [isFull, setIsFull] = createSignal(false);

  const itemClasses = () =>
    rhetoric({ isItem: true, chainRole: props.chainRole }).join(" ");

  const foldClasses = () =>
    rhetoric({ isFolded: true }).join(" ");

  return (
    <div id={props.item[props.item._]} className={`${styles.item} ${itemClasses()}`}>
      <div className={foldClasses()}>
        <div className={styles.content} ref={setContent}>
          <OverviewValue
            branch={props.item._}
            value={props.item[props.item._]}
            path={props.path || [props.item._]}
            defaultShow={true}
          />
        </div>
      </div>

      <button onClick={() => props.onSelect?.()}>
        {props.actionLabel}
      </button>
    </div>
  );
}
