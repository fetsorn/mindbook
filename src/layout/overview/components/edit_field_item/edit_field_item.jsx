import { useContext } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context, onRecordEdit } from "@/store/store.js";
import { Spoiler } from "@/layout/components/index.js";
import { EditRecord, EditValue } from "../index.js";

function proseLabel(key, locale, t) {
  const langTag = key.slice(1);
  return langTag
    ? new Intl.DisplayNames([locale], { type: "language" }).of(langTag)
    : t`is`;
}

export function EditFieldItem(props) {
  const { store, setStore } = useContext(Context);
  const { i18n, t } = useLingui();

  // if base has no leaves, show value
  // otherwise show record with buttons that can add leaves
  const baseIsTwig = () => {
    if (store.schema === undefined || store.schema[props.branch] === undefined)
      return true;

    return store.schema[props.branch].leaves.length === 0;
  };

  // normalize: string items become { _: branch, [branch]: item }
  const record = () =>
    typeof props.item === "object"
      ? props.item
      : { _: props.branch, [props.branch]: props.item };

  const value = () =>
    typeof props.item === "object" ? props.item[props.branch] : props.item;

  const proseKeys = () => {
    if (typeof props.item !== "object" || props.item === null) return [];
    return Object.keys(props.item).filter((k) => k.startsWith("@"));
  };

  return (
    <Switch
      fallback={
        <EditRecord
          index={`${props.index}-${record()[record()._]}`}
          record={record()}
          path={props.path}
          rstIndex={props.rstIndex}
        />
      }
    >
      <Match when={baseIsTwig()}>
        <EditValue
          value={value()}
          branch={props.branch}
          path={props.path}
          rstIndex={props.rstIndex}
        />

        <Spoiler
          index={`${props.index}-prose`}
          title={t`is`}
          isOpenDefault={false}
        >
          <Show when={
            typeof props.item !== "object"
              || (props.item !== null && props.item["@"] === undefined)
          }>
            <button
              onClick={() => {
                if (typeof props.item === "object" && props.item !== null) {
                  onRecordEdit(
                    { setStore },
                    [...props.path, "@"],
                    "",
                  );
                } else {
                  onRecordEdit(
                    { setStore },
                    props.path,
                    { _: props.branch, [props.branch]: props.item, "@": "" },
                  );
                }
              }}
            >
              +
            </button>
          </Show>

          <For each={proseKeys()}>
            {(key) => (
              <>
                <label for={`edit-${props.branch}-${key}`}>{proseLabel(key, i18n().locale, t)} - </label>
                <textarea
                  id={`edit-${props.branch}-${key}`}
                  onInput={async (event) => {
                    await onRecordEdit(
                      { setStore },
                      [...props.path, key],
                      event.target.value,
                    );
                  }}
                >
                  {props.item[key]}
                </textarea>
              </>
            )}
          </For>
        </Spoiler>
      </Match>
    </Switch>
  );
}
