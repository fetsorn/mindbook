import { useContext } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context } from "@/store/store.js";
import { rhetoric } from "@/style/rhetoric.js";
import { pathToKey } from "@/style/index_builder.js";
import { Spoiler } from "@/layout/components/index.js";
import { OverviewField, OverviewValue } from "../index.js";

export function OverviewRecord(props) {
  const { store } = useContext(Context);
  const { t, i18n } = useLingui();

  const path = () => props.path || [];

  const meta = () => {
    const key = pathToKey(path());
    return props.rstIndex?.get(key) || {};
  };

  const recordClasses = () =>
    rhetoric(meta()).join(" ");

  function recordHasLeaf(leaf) {
    return props.record.hasOwnProperty(leaf);
  }

  return (
    <span className={recordClasses()}>
      <OverviewValue
        branch={props.record._}
        value={props.record[props.record._]}
        path={[...path(), props.record._]}
        rstIndex={props.rstIndex}
      />

      <Show
        when={Object.entries(props.record).filter(([k]) => k.startsWith("@")).length > 0}
      >
        <Spoiler
          index={`${props.index}-prose`}
          title={t`is`}
          isOpenDefault={false}
        >
          <span className={`${props.record._}-prose`}>
            {props.record[`@${i18n().locale}`] ?? props.record["@"]}
          </span>
        </Spoiler>
      </Show>

      <Show
        when={
          store.schema[props.record._].leaves.filter(recordHasLeaf).length > 0
        }
        fallback={<></>}
      >
        <Spoiler
          index={props.index}
          title={t`with`}
          isOpenDefault={props.isOpenDefault}
        >
          <For
            each={
              store.schema !== undefined &&
              props.record !== undefined &&
              store.schema[props.record._] !== undefined &&
              store.schema[props.record._].leaves.filter(recordHasLeaf)
            }
            fallback={<span>{t`record no items`}</span>}
          >
            {(leaf, index) => {
              const value = props.record[leaf];

              const items = Array.isArray(value) ? value : [value];

              return (
                <OverviewField
                  index={`${props.index}-${leaf}`}
                  items={items}
                  branch={leaf}
                  path={[...path(), leaf]}
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
