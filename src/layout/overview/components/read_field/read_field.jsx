import { rhetoric } from "@/style/rhetoric.js";
import { pathToKey } from "@/style/index_builder.js";
import { Spoiler } from "@/layout/components/index.js";
import { ReadFieldItem } from "../index.js";

export function ReadField(props) {
  const path = () => props.path || [];

  const meta = () => {
    const key = pathToKey(path());
    return props.rstIndex?.get(key) || {};
  };

  const fieldClasses = () =>
    rhetoric(meta()).join(" ");

  const items = () =>
    Array.isArray(props.items) ? props.items : [props.items];

  return (
    <span className={fieldClasses()}>
      <Show when={items()[0] !== undefined} fallback={<></>}>
        <ReadFieldItem
          index={`${props.index}-0`}
          item={items()[0]}
          branch={props.branch}
          path={[...path(), 0]}
          rstIndex={props.rstIndex}
        />
      </Show>

      <Show when={items().length > 1}>
        <Spoiler index={`${props.index}spoiler`} title={"and"}>
          <For each={items().slice(1)} fallback={<></>}>
            {(item, index) => {
              return (
                <>
                  <Show when={index() > 0}>; </Show>
                  <ReadFieldItem
                    index={`${props.index}-${index}`}
                    item={item}
                    branch={props.branch}
                    path={[...path(), index + 1]}
                    rstIndex={props.rstIndex}
                  />
                </>
              );
            }}
          </For>
        </Spoiler>
      </Show>
    </span>
  );
}
