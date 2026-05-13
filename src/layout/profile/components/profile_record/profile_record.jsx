import { useContext } from "solid-js";
import { Context, onRecordEdit } from "@/store/store.js";
import { Spoiler, Confirmation } from "@/layout/components/index.js";
import { ProfileField, ProfileValue } from "../index.js";

export function ProfileRecord(props) {
  const { store, setStore } = useContext(Context);

  const leaves = () => {
    if (
      store.schema === undefined ||
      store.schema[props.record._] === undefined
    )
      return [];

    return store.schema[props.record._].leaves;
  };

  function access(field) {
    return props.record !== undefined ? props.record[field] : undefined;
  }

  return (
    <>
      <ProfileValue
        value={access(access("_"))}
        branch={access("_")}
        path={[...props.path, access("_")]}
      />

      <Show when={access("@") === undefined}>
        <button
          onClick={() =>
            onRecordEdit({ setStore }, [...props.path, "@"], "")
          }
        >
          @
        </button>
      </Show>

      <For each={Object.keys(props.record ?? {}).filter((k) => k.startsWith("@"))}>
        {(key) => (
          <>
            <label for={`profile-${access("_")}-${key}`}>{key} - </label>
            <textarea
              id={`profile-${access("_")}-${key}`}
              onInput={async (event) => {
                await onRecordEdit(
                  { setStore },
                  [...props.path, key],
                  event.target.value,
                );
              }}
            >
              {access(key)}
            </textarea>
          </>
        )}
      </For>

      <Spoiler
        index={`${props.index}-spoilerfield`}
        title={"with"}
        isOpenDefault={props.isOpenDefault}
      >
        <Spoiler index={`${props.index}-spoileradd`} title={"add"}>
          <Index each={leaves()} fallback={<>...</>}>
            {(leaf, index) => {
              const addNew = () =>
                onRecordEdit(
                  { setStore },
                  [...props.path, leaf()],
                  [
                    {
                      _: leaf(),
                      [leaf()]: "",
                    },
                  ],
                );

              const addAnother = () =>
                onRecordEdit(
                  { setStore },
                  [...props.path, leaf(), access(leaf()).length],
                  {
                    _: leaf(),
                    [leaf()]: "",
                  },
                );

              return (
                <button
                  className={"profileAddNew"}
                  onClick={() =>
                    props.record.hasOwnProperty(leaf())
                      ? addAnother()
                      : addNew()
                  }
                >
                  {leaf()}{" "}
                </button>
              );
            }}
          </Index>
        </Spoiler>

        <Index
          each={leaves()}
          fallback={<span>record but branch is twig</span>}
        >
          {(leaf, index) => (
            <ProfileField
              index={`${props.index}-${leaf()}`}
              branch={leaf()}
              items={access(leaf()) ?? []}
              path={[...props.path, leaf()]}
            />
          )}
        </Index>
      </Spoiler>
    </>
  );
}
