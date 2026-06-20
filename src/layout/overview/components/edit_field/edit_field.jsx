import { useContext, createEffect } from "solid-js";
import { Context, onRecordEdit } from "@/store/store.js";
import { rhetoric } from "@/style/rhetoric.js";
import { pathToKey } from "@/style/index_builder.js";
import { Spoiler, Confirmation } from "@/layout/components/index.js";
import { EditFieldItem } from "../index.js";

// can't move this to field item
// because remove needs to filter props.items
function EditFieldEntry(props) {
  const context = useContext(Context);

  return (
    <>
      <Confirmation
        action={`cut...`}
        question={"really cut?"}
        onAction={() =>
          onRecordEdit(
            context,
            props.path,
            props.items.filter((el, i) => i !== props.i),
          )
        }
      />

      <EditFieldItem
        index={`${props.index}-${props.i}`}
        branch={props.branch}
        item={props.item}
        path={[...props.path, props.i]}
        rstIndex={props.rstIndex}
      />
    </>
  );
}

export function EditField(props) {
  const context = useContext(Context);

  const meta = () => {
    const key = pathToKey(props.path || []);
    return props.rstIndex?.get(key) || {};
  };

  const fieldClasses = () =>
    rhetoric(meta()).join(" ");

  // if props.items is not a list, treat is as list
  const items = () =>
    Array.isArray(props.items) ? props.items : [props.items];

  // and make sure props.items becomes a list in the store
  createEffect(() => {
    if (!Array.isArray(props.items))
      onRecordEdit(context, props.path, [props.items]);
  });

  return (
    <span className={fieldClasses()}>
      <Show when={items()[0] !== undefined}>
        <EditFieldEntry
          index={`${props.index}`}
          branch={props.branch}
          path={props.path}
          item={items()[0]}
          items={items()}
          i={0}
          rstIndex={props.rstIndex}
        />
      </Show>

      <Show when={items().length > 1}>
        <Spoiler index={`${props.index}spoiler`} title={"and"}>
          <Index each={items().slice(1)} fallback={<></>}>
            {(item, index) => (
              <EditFieldEntry
                index={`${props.index}`}
                branch={props.branch}
                path={props.path}
                item={item()}
                items={items()}
                i={index + 1}
                rstIndex={props.rstIndex}
              />
            )}
          </Index>
        </Spoiler>
      </Show>
    </span>
  );
}
