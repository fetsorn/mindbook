import { useContext, createEffect } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context, onRecordEdit } from "@/store/store.js";
import { rhetoric } from "@/style/rhetoric.js";
import { pathToKey } from "@/style/index_builder.js";
import { Spoiler, Confirmation } from "@/layout/components/index.js";
import { ItemFieldItem } from "../index.js";

export function ItemField(props) {
  const context = useContext(Context);
  const { t } = useLingui();

  const meta = () => {
    const key = pathToKey(props.path || []);
    return props.rstIndex?.get(key) || {};
  };

  const fieldClasses = () =>
    rhetoric(meta()).join(" ");

  const items = () =>
    Array.isArray(props.items) ? props.items : [props.items];

  // Edit-only: normalize to array in the store
  createEffect(() => {
    if (props.editing && !Array.isArray(props.items))
      onRecordEdit(context, props.path, [props.items]);
  });

  return (
    <span className={fieldClasses()}>
      <Show when={items()[0] !== undefined} fallback={<></>}>
        <Show when={props.editing}>
          <Confirmation
            action={t`cut...`}
            question={t`really cut?`}
            onAction={() =>
              onRecordEdit(
                context,
                props.path,
                items().filter((el, i) => i !== 0),
              )
            }
          />
        </Show>

        <ItemFieldItem
          index={`${props.index}-0`}
          item={items()[0]}
          branch={props.branch}
          path={[...props.path, 0]}
          rstIndex={props.rstIndex}
          editing={props.editing}
        />
      </Show>

      <Show when={items().length > 1}>
        <Spoiler index={`${props.index}spoiler`} title={t`and`}>
          <For each={items().slice(1)} fallback={<></>}>
            {(item, index) => (
              <>
                <Show when={!props.editing && index() > 0}>; </Show>

                <Show when={props.editing}>
                  <Confirmation
                    action={t`cut...`}
                    question={t`really cut?`}
                    onAction={() =>
                      onRecordEdit(
                        context,
                        props.path,
                        items().filter((el, i) => i !== index() + 1),
                      )
                    }
                  />
                </Show>

                <ItemFieldItem
                  index={`${props.index}-${index() + 1}`}
                  item={item}
                  branch={props.branch}
                  path={[...props.path, index() + 1]}
                  rstIndex={props.rstIndex}
                  editing={props.editing}
                />
              </>
            )}
          </For>
        </Spoiler>
      </Show>
    </span>
  );
}
