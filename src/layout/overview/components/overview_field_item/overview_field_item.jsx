import { useContext } from "solid-js";
import { Context } from "@/store/store.js";
import { OverviewRecord, OverviewValue } from "../index.js";

export function OverviewFieldItem(props) {
  const { store } = useContext(Context);

  const path = () => props.path || [];

  // if base has no leaves, show value
  // otherwise show record
  const baseIsTwig = () => {
    if (store.schema === undefined || store.schema[props.branch] === undefined)
      return true;

    return store.schema[props.branch].leaves.length === 0;
  };

  return (
    <Switch
      fallback={
        <OverviewRecord
          index={`${props.index}-${props.item[props.item._]}`}
          record={
            typeof props.item === "object"
              ? props.item
              : { _: props.branch, [props.branch]: props.item }
          }
          path={path()}
          rstIndex={props.rstIndex}
        />
      }
    >
      <Match when={baseIsTwig()}>
        <OverviewValue
          branch={props.branch}
          value={typeof props.item === "object" ? props.item[props.item._] : props.item}
          path={path()}
          rstIndex={props.rstIndex}
        />

        <Show when={typeof props.item === "object" && props.item !== null}>
          <For each={Object.entries(props.item ?? {}).filter(([k]) => k.startsWith("@"))}>
            {([key, text]) => (
              <span className={`${props.branch}-prose`}>
                {text}
              </span>
            )}
          </For>
        </Show>
      </Match>
    </Switch>
  );
}
