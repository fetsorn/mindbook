import { useContext } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context } from "@/store/store.js";
import { Spoiler } from "@/layout/components/index.js";
import { ReadRecord, ReadProse, ReadValue } from "../index.js";

export function ReadFieldItem(props) {
  const { store } = useContext(Context);
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

  return (
    <Switch
      fallback={
        <ReadRecord
          index={`${props.index}-${record()[record()._]}`}
          record={record()}
          path={props.path}
          rstIndex={props.rstIndex}
        />
      }
    >
      <Match when={baseIsTwig()}>
        <ReadValue
          branch={props.branch}
          value={value()}
          path={props.path}
          rstIndex={props.rstIndex}
        />

        <For each={proseKeys()}>
          {(key) => {
            const langTag = key.slice(1);
            const label = langTag
              ? new Intl.DisplayNames([i18n().locale], { type: "language" }).of(langTag)
              : t`is`;

            return (
              <Spoiler
                index={`${props.index}-prose-${key}`}
                title={label}
                isOpenDefault={false}
              >
                <ReadProse
                  label={label}
                  value={props.item[key]}
                />
              </Spoiler>
            );
          }}
        </For>
      </Match>
    </Switch>
  );
}
