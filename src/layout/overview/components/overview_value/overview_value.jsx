import { createSignal, useContext } from "solid-js";
import { useLingui } from "@lingui/solid";
import { Context } from "@/store/store.js";
import { rhetoric } from "@/style/rhetoric.js";
import { pathToKey } from "@/style/index_builder.js";
import { Spoiler } from "@/layout/components/index.js";

export function OverviewValue(props) {
  const { store } = useContext(Context);
  const { _ } = useLingui();

  const isBase = props.branch === store.base;

  const defaultIsValue = props.defaultShow ?? !isBase;

  const [isValue, setIsValue] = createSignal(defaultIsValue);

  const path = () => props.path || [];

  const meta = () => {
    const key = pathToKey(path());
    return props.rstIndex?.get(key) || {};
  };

  const nucleusClasses = () =>
    rhetoric({ ...meta(), isValueToggle: true }).join(" ");

  // TODO: add schema[base].cognate from branch-cognate.csv
  const basePartial = isBase ? [] : [props.branch];

  //const foo = store.schema[props.branch].trunks.some((t) =>
  //  store.schema[cognate].trunks.includes(t),
  //);

  // empty object if no branch in schema
  const branchObject = store.schema[props.branch] ?? {};

  const cognatePartial = (branchObject.cognates ?? []).concat(basePartial);

  const recurses = cognatePartial.filter((cognate) =>
    (branchObject.trunks ?? []).includes(cognate),
  );

  const neighbours = cognatePartial.filter(
    (cognate) =>
      store.schema[cognate] &&
      cognatePartial.some((p) => store.schema[cognate].trunks.includes(p)),
  );

  return (
    <>
      <Show
        when={isValue()}
        fallback={
          <button
            className={`${props.branch}-branch ${nucleusClasses()}`}
            onClick={() => setIsValue(true)}
          >
            {props.branch}{" "}
          </button>
        }
      >
        <button
          className={`${props.branch}-value ${nucleusClasses()}`}
          onClick={() => {
            navigator.clipboard.writeText(props.value);
            setIsValue(false);
          }}
        >
          {props.value}
        </button>
      </Show>
    </>
  );
}
