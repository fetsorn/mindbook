import { useContext } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context, onRecordEdit } from "@/store/store.js";
import { Spoiler } from "@/layout/components/index.js";
import { ItemRecord, ItemProse, ItemValueRead, ItemValueEdit } from "../index.js";

function proseLabel(key, locale, t) {
  const langTag = key.slice(1);
  return langTag
    ? new Intl.DisplayNames([locale], { type: "language" }).of(langTag)
    : t`is`;
}

export function ItemFieldItem(props) {
  const { store, setStore } = useContext(Context);
  const { i18n, t } = useLingui();

  // if base has no leaves, show value
  // otherwise show record
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

  const Value = props.editing ? ItemValueEdit : ItemValueRead;

  return (
    <Switch
      fallback={
        <ItemRecord
          index={`${props.index}-${record()[record()._]}`}
          record={record()}
          path={props.path}
          rstIndex={props.rstIndex}
          editing={props.editing}
        />
      }
    >
      <Match when={baseIsTwig()}>
        <Value
          value={value()}
          branch={props.branch}
          path={props.path}
          rstIndex={props.rstIndex}
        />

        {/* Prose */}
        <For each={proseKeys()}>
          {(key) => (
            <Spoiler
              index={`${props.index}-prose-${key}`}
              title={proseLabel(key, i18n().locale, t)}
              isOpenDefault={false}
            >
              <ItemProse
                label={proseLabel(key, i18n().locale, t)}
                value={props.item[key]}
                editing={props.editing}
                onInput={(html) =>
                  onRecordEdit({ setStore }, [...props.path, key], html)
                }
              />
            </Spoiler>
          )}
        </For>

        {/* Edit-only: button to add prose when none exists */}
        <Show when={props.editing && (
          typeof props.item !== "object"
            || (props.item !== null && props.item["@"] === undefined)
        )}>
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
      </Match>
    </Switch>
  );
}
