import { useContext } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context, onRecordEdit, visibleProseKeys } from "@/store/store.js";
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

  // When item is an object, write to the value inside it (preserving _ and @ keys);
  // when it's a plain string, write to the array slot directly.
  const valuePath = () =>
    typeof props.item === "object" && props.item !== null
      ? [...props.path, props.branch]
      : props.path;

  const proseKeys = () =>
    typeof props.item === "object" && props.item !== null
      ? visibleProseKeys(props.item, i18n().locale, props.editing)
      : [];

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
          path={valuePath()}
          rstIndex={props.rstIndex}
        />

        {/* Prose */}
        <For each={proseKeys()}>
          {(key) => (
            <Spoiler
              index={`${props.index}-prose-${key}`}
              title={props.editing ? proseLabel(key, i18n().locale, t) : t`is`}
              isOpenDefault={props.editing}
            >
              <ItemProse
                value={props.item[key]}
                editing={props.editing}
                onInput={(html) =>
                  onRecordEdit({ setStore }, [...props.path, key], html)
                }
              />
            </Spoiler>
          )}
        </For>

        {/* Edit-only: add prose for current locale */}
        <Show when={props.editing && (
          typeof props.item !== "object"
            || (props.item !== null && props.item[`@${i18n().locale}`] === undefined)
        )}>
          <Spoiler index={`${props.index}-spoileradd`} title={t`add`}>
            <button
              className={"profileAddNew"}
              onClick={() => {
                const localeKey = `@${i18n().locale}`;
                if (typeof props.item === "object" && props.item !== null) {
                  onRecordEdit(
                    { setStore },
                    [...props.path, localeKey],
                    "",
                  );
                } else {
                  onRecordEdit(
                    { setStore },
                    props.path,
                    { _: props.branch, [props.branch]: props.item, [localeKey]: "" },
                  );
                }
              }}
            >
              {proseLabel(`@${i18n().locale}`, i18n().locale, t)}{" "}
            </button>
          </Spoiler>
        </Show>
      </Match>
    </Switch>
  );
}
