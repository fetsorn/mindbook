import { createElementSize } from "@solid-primitives/resize-observer";
import { useContext, createSignal, createEffect } from "solid-js";
import {
  Context,
  onRecordEdit,
  onRecordWipe,
  onAction,
} from "@/store/store.js";
import { rhetoric } from "@/style/rhetoric.js";
import { buildIndex } from "@/style/index_builder.js";
import { Confirmation, Spoiler } from "@/layout/components/index.js";
import { OverviewRecord } from "../index.js";
import styles from "./overview_item_full.module.css";

export function OverviewItemFull(props) {
  const { store, setStore, api } = useContext(Context);

  const [content, setContent] = createSignal();

  const size = createElementSize(content);

  const [showActions, setShowActions] = createSignal(false);

  const [isBigItem, setIsBigItem] = createSignal(false);

  const [isFold, setIsFold] = createSignal(true);

  const base = () => props.item._;

  const isTwig = () =>
    !store.schema[base()] || store.schema[base()].leaves.length === 0;

  const rstIndex = () => buildIndex(props.item, store.schema, props.path || []);

  const itemClasses = () => rhetoric({ isItem: true }).join(" ");

  const foldClasses = () => rhetoric({ isFolded: isFold() }).join(" ");

  return (
    <div
      id={props.item[props.item._]}
      className={`${styles.item} ${itemClasses()}`}
    >
      <div className={styles.chrome}>
        <div className={foldClasses()}>
          <div className={styles.content} ref={setContent}>
            <OverviewRecord
              index={props.index}
              record={props.item}
              path={props.path || []}
              rstIndex={rstIndex()}
              isOpenDefault={true}
            />
          </div>
        </div>

        <Show when={size.height > 40}>
          <Show
            when={isFold()}
            fallback={<button onClick={() => setIsFold(true)}>less...</button>}
          >
            <button onClick={() => setIsFold(false)}>more...</button>
          </Show>
        </Show>

        <Show when={!showActions()}>
          <button onClick={() => setShowActions(true)}>.</button>
        </Show>
      </div>

      <Show when={showActions()}>
        <div className={styles.actions}>
          <Show when={!isTwig()}>
            <button
              className={"edit"}
              onClick={() => {
                onRecordEdit(
                  { setStore },
                  ["record"],
                  JSON.parse(JSON.stringify(props.item)),
                );

                setShowActions(false);
              }}
            >
              edit{" "}
            </button>

            <Confirmation
              action={`delete`}
              question={"really delete?"}
              onAction={() =>
                onRecordWipe({ store, setStore, api }, props.item)
              }
              onCancel={() => setShowActions(false)}
            />
          </Show>

          <For each={store.actions[base()] || []}>
            {(action, index) => {
              return (
                <button
                  title={action}
                  onClick={() => onAction({ store, api }, action, props.item)}
                >
                  {action}{" "}
                </button>
              );
            }}
          </For>
        </div>
      </Show>
    </div>
  );
}
