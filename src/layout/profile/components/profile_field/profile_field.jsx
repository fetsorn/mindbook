import { useContext, createEffect } from "solid-js";
import { Context, onRecordEdit } from "@/store/store.js";
import { Spoiler, Confirmation } from "@/layout/components/index.js";
import { ProfileFieldItem } from "../index.js";

// can't move this to field item
// because remove needs to filter props.items
export function Foo(props) {
  const context = useContext(Context);

  return (
    <>
      <br />

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

      <ProfileFieldItem
        index={`${props.index}-${props.i}`}
        branch={props.branch}
        item={props.item}
        path={[...props.path, props.i]}
      />
    </>
  );
}

export function ProfileField(props) {
  const context = useContext(Context);

  // if props.items is not a list, treat is as list
  const items = () =>
    Array.isArray(props.items) ? props.items : [props.items];

  // and make sure props.items becomes a list in the store
  createEffect(() => {
    if (!Array.isArray(props.items))
      onRecordEdit(context, props.path, [props.items]);
  });

  return (
    <>
      <Show when={items()[0] !== undefined}>
        <Foo
          index={`${props.index}`}
          branch={props.branch}
          path={props.path}
          item={items()[0]}
          items={items()}
          i={0}
        />
      </Show>

      <Show when={items().length > 1}>
        <br />

        <Spoiler index={`${props.index}spoiler`} title={"and"}>
          <Index each={items().slice(1)} fallback={<></>}>
            {(item, index) => (
              <Foo
                index={`${props.index}`}
                branch={props.branch}
                path={props.path}
                item={item()}
                items={items()}
                i={index + 1}
              />
            )}
          </Index>
        </Spoiler>
      </Show>
    </>
  );
}
