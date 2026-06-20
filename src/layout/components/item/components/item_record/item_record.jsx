import { useContext } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context, onRecordEdit, branchTitle, visibleProseKeys } from "@/store/store.js";
import { rhetoric } from "@/style/rhetoric.js";
import { pathToKey } from "@/style/index_builder.js";
import { Spoiler } from "@/layout/components/index.js";
import { ItemField, ItemProse, ItemValueRead, ItemValueEdit } from "../index.js";

export function ItemRecord(props) {
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
    return props.record[leaf] !== undefined;
  }

  const meta = () => {
    const key = pathToKey(props.path || []);
    return props.rstIndex?.get(key) || {};
  };

  const recordClasses = () =>
    rhetoric(meta()).join(" ");

  function proseLabel(key) {
    const langTag = key.slice(1);
    return langTag
      ? new Intl.DisplayNames([i18n().locale], { type: "language" }).of(langTag)
      : t`is`;
  }

  const Value = props.editing ? ItemValueEdit : ItemValueRead;

  const proseKeys = () =>
    visibleProseKeys(props.record, i18n().locale, props.editing);

  return (
    <span className={recordClasses()}>
      <Value
        branch={props.record._}
        value={props.record[props.record._]}
        path={[...props.path, props.record._]}
        rstIndex={props.rstIndex}
      />

      {/* Prose */}
      <For each={proseKeys()}>
        {(key) => (
          <Spoiler
            index={`${props.index}-prose-${key}`}
            title={props.editing ? proseLabel(key) : t`is`}
            isOpenDefault={props.editing}
          >
            <ItemProse
              value={props.record[key]}
              editing={props.editing}
              label={`${proseLabel(key)} -`}
              onInput={(html) =>
                onRecordEdit({ setStore }, [...props.path, key], html)
              }
            />
          </Spoiler>
        )}
      </For>

      <Spoiler
        index={props.index}
        title={t`with`}
        isOpenDefault={props.isOpenDefault}
      >
        {/* Edit-only: add leaf buttons */}
        <Show when={props.editing}>
          <Spoiler index={`${props.index}-spoileradd`} title={t`add`}>
            <Show when={props.record[`@${i18n().locale}`] === undefined}>
              <button
                className={"profileAddNew"}
                onClick={() =>
                  onRecordEdit(
                    { setStore },
                    [...props.path, `@${i18n().locale}`],
                    "",
                  )
                }
              >
                {proseLabel(`@${i18n().locale}`)}{" "}
              </button>
            </Show>

            <Index each={leaves()} fallback={<>...</>}>
              {(leaf) => {
                const addNew = () =>
                  onRecordEdit(
                    { setStore },
                    [...props.path, leaf()],
                    [{ _: leaf(), [leaf()]: "" }],
                  );

                const addAnother = () =>
                  onRecordEdit(
                    { setStore },
                    [...props.path, leaf(), props.record[leaf()].length],
                    { _: leaf(), [leaf()]: "" },
                  );

                return (
                  <button
                    className={"profileAddNew"}
                    onClick={() =>
                      recordHasLeaf(leaf()) ? addAnother() : addNew()
                    }
                  >
                    {branchTitle(store.schema, leaf(), i18n().locale)}{" "}
                  </button>
                );
              }}
            </Index>
          </Spoiler>
        </Show>

        <For
          each={leaves().filter(recordHasLeaf)}
          fallback={<span>{t`record no items`}</span>}
        >
          {(leaf) => {
            return (
              <ItemField
                index={`${props.index}-${leaf}`}
                items={props.record[leaf]}
                branch={leaf}
                path={[...props.path, leaf]}
                rstIndex={props.rstIndex}
                editing={props.editing}
              />
            );
          }}
        </For>
      </Spoiler>
    </span>
  );
}
