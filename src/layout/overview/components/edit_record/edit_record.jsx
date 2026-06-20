import { useContext } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context, onRecordEdit, branchTitle } from "@/store/store.js";
import { rhetoric } from "@/style/rhetoric.js";
import { pathToKey } from "@/style/index_builder.js";
import { Spoiler } from "@/layout/components/index.js";
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

  function recordHasLeaf(leaf) {
    return props.record.hasOwnProperty(leaf);
  }

  const meta = () => {
    const key = pathToKey(props.path || []);
    return props.rstIndex?.get(key) || {};
  };

  const recordClasses = () =>
    rhetoric(meta()).join(" ");

  return (
    <span className={recordClasses()}>
      <EditValue
        value={props.record[props.record._]}
        branch={props.record._}
        path={[...props.path, props.record._]}
        rstIndex={props.rstIndex}
      />

      <Show when={props.record["@"] === undefined}>
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
              value={props.record[key]}
              onInput={(html) =>
                onRecordEdit({ setStore }, [...props.path, key], html)
              }
            />
          );
        }}
      </For>

      <Spoiler
        index={props.index}
        title={t`with`}
        isOpenDefault={props.isOpenDefault}
      >
        <Spoiler index={`${props.index}-spoileradd`} title={t`add`}>
          <Index each={leaves()} fallback={<>...</>}>
            {(leaf) => {
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
                  [...props.path, leaf(), props.record[leaf()].length],
                  {
                    _: leaf(),
                    [leaf()]: "",
                  },
                );

              return (
                <button
                  className={"profileAddNew"}
                  onClick={() =>
                    recordHasLeaf(leaf())
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

        <For
          each={leaves().filter(recordHasLeaf)}
          fallback={<span>{t`record no items`}</span>}
        >
          {(leaf) => (
            <EditField
              index={`${props.index}-${leaf}`}
              branch={leaf}
              items={props.record[leaf] ?? []}
              path={[...props.path, leaf]}
              rstIndex={props.rstIndex}
            />
          )}
        </For>
      </Spoiler>
    </span>
  );
}
