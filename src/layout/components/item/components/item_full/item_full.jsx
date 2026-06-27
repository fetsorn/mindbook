import { useContext, createSignal } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import {
  Context,
  onRecordEdit,
  onRecordSave,
  onRecordWipe,
  onAction,
  setFocus,
} from "@/store/store.js";
import { rhetoric } from "@/style/rhetoric.js";
import { buildIndex } from "@/style/index_builder.js";
import { Confirmation, SpoilerFocusContext } from "@/layout/components/index.js";
import { ItemRecord } from "../index.js";
import styles from "./item_full.module.css";

export function ItemFull(props) {
  const { store, setStore, api } = useContext(Context);
  const { t } = useLingui();

  const base = () => props.item._;

  const key = () => props.item[props.item._];

  const isFocused = () => store.focus === key();

  const [content, setContent] = createSignal();

  const [isUnfolded, setIsUnfolded] = createSignal(false);

  const isFold = () => !isFocused() && !isUnfolded();

  const isEditing = () =>
    store.record !== undefined && store.editingKey === key();

  const isTwig = () =>
    !store.schema[base()] || store.schema[base()].leaves.length === 0;

  const unfoldThis = () => setIsUnfolded(true);

  const rstIndex = () => buildIndex(props.item, store.schema, props.path || []);

  const itemClasses = () => rhetoric({ isItem: true }).join(" ");

  const foldClasses = () => rhetoric({ isFolded: isFold() }).join(" ");

  return (
    <SpoilerFocusContext.Provider value={unfoldThis}>
    <div
      id={key()}
      className={`${styles.item} ${itemClasses()} ${isEditing() ? styles.editing : ""} ${store.record !== undefined && !isEditing() ? styles.dimmed : ""}`}
    >
      <Show
        when={isEditing()}
        fallback={
          <>
            <div className={styles.chrome}>
              <div className={foldClasses()}>
                <div className={styles.content} ref={setContent}>
                  <ItemRecord
                    index={props.index}
                    record={props.item}
                    path={props.path || []}
                    rstIndex={rstIndex()}
                    isOpenDefault={true}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (isFocused()) {
                    setFocus({ store, setStore, api }, null);
                    setIsUnfolded(false);
                  } else {
                    setFocus({ store, setStore, api }, key());
                  }
                }}
              >
                …
              </button>
            </div>

            <Show when={isFocused()}>
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
                    }}
                  >
                    {t`edit`}{" "}
                  </button>

                  <Confirmation
                    action={t`delete`}
                    question={t`really delete?`}
                    onAction={() =>
                      onRecordWipe({ store, setStore, api }, props.item)
                    }
                    onCancel={() => setFocus({ store, setStore, api }, null)}
                  />
                </Show>

                <For each={store.actions[base()] || []}>
                  {(action, index) => {
                    return (
                      <button
                        title={action}
                        onClick={() =>
                          onAction({ store, api }, action, props.item)
                        }
                      >
                        {action}{" "}
                      </button>
                    );
                  }}
                </For>
              </div>
            </Show>
          </>
        }
      >
        <>
          <ItemRecord
            index={`${props.index}-edit`}
            record={store.record}
            path={["record"]}
            rstIndex={rstIndex()}
            isOpenDefault={true}
            editing={true}
          />

          <div className={styles.editActions}>
            <button
              onClick={() =>
                onRecordSave({ store, setStore, api }, props.item, store.record)
              }
            >
              {t`save`}
            </button>

            <button
              onClick={() => onRecordEdit({ setStore }, ["record"], undefined)}
            >
              {t`revert`}
            </button>
          </div>
        </>
      </Show>
    </div>
    </SpoilerFocusContext.Provider>
  );
}
