import { useContext } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context } from "@/store/store.js";
import { rhetoric } from "@/style/rhetoric.js";
import { pathToKey } from "@/style/index_builder.js";
import { Spoiler } from "@/layout/components/index.js";
import { ReadField, ReadProse, ReadValue } from "../index.js";

export function ReadRecord(props) {
  const { store } = useContext(Context);
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
      <ReadValue
        branch={props.record._}
        value={props.record[props.record._]}
        path={[...props.path, props.record._]}
        rstIndex={props.rstIndex}
      />

      <For each={Object.keys(props.record ?? {}).filter((k) => k.startsWith("@"))}>
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
                value={props.record[key]}
              />
            </Spoiler>
          );
        }}
      </For>

      <Show
        when={leaves().filter(recordHasLeaf).length > 0}
        fallback={<></>}
      >
        <Spoiler
          index={props.index}
          title={t`with`}
          isOpenDefault={props.isOpenDefault}
        >
          <For
            each={leaves().filter(recordHasLeaf)}
            fallback={<span>{t`record no items`}</span>}
          >
            {(leaf) => {
              const value = props.record[leaf];

              const items = Array.isArray(value) ? value : [value];

              return (
                <ReadField
                  index={`${props.index}-${leaf}`}
                  items={items}
                  branch={leaf}
                  path={[...props.path, leaf]}
                  rstIndex={props.rstIndex}
                />
              );
            }}
          </For>
        </Spoiler>
      </Show>
    </span>
  );
}
