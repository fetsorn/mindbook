import { useContext } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context, onRecordEdit, branchTitle } from "@/store/store.js";
import { Spoiler, Confirmation } from "@/layout/components/index.js";
import { EditField, EditProse, EditValue } from "../index.js";

export function EditRecord(props) {
  const { store, setStore } = useContext(Context);
  const { i18n, t } = useLingui();

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
      <EditValue
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
          {t`is`}
        </button>
      </Show>

      <For each={Object.keys(props.record ?? {}).filter((k) => k.startsWith("@"))}>
        {(key) => {
          const langTag = key.slice(1);
          const label = langTag
            ? new Intl.DisplayNames([i18n().locale], { type: "language" }).of(langTag)
            : t`is`;

          return (
            <EditProse
              label={label}
              value={access(key)}
              onInput={(html) =>
                onRecordEdit({ setStore }, [...props.path, key], html)
              }
            />
          );
        }}
      </For>

      <Spoiler
        index={`${props.index}-spoilerfield`}
        title={t`with`}
        isOpenDefault={props.isOpenDefault}
      >
        <Spoiler index={`${props.index}-spoileradd`} title={t`add`}>
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
                  {branchTitle(store.schema, leaf(), i18n().locale)}{" "}
                </button>
              );
            }}
          </Index>
        </Spoiler>

        <Index
          each={leaves()}
          fallback={<span>{t`record no items`}</span>}
        >
          {(leaf, index) => (
            <EditField
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
