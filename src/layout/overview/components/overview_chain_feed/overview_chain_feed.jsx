import { useContext } from "solid-js";
import { Context, getBase, setFocus } from "@/store/store.js";
import { rhetoric } from "@/style/rhetoric.js";
import { OverviewItem, OverviewItemLight } from "../index.js";

// The overview feed with inline ego network.
//
// Every record in recordSet renders as a flat feed item.
// When a record is the current focus AND chainBy is set,
// its ego network (causes above, results below) renders
// as shadow nodes around it inline in the feed.
//
// egoCauses and egoResults are arrays of keys. Records
// are read from recordMap (shared cache with the feed).
export function OverviewChainFeed() {
  const context = useContext(Context);
  const { store } = context;

  const base = () => getBase({ store });

  const chainClasses = (chainRole) => rhetoric({ chainRole }).join(" ");

  const isFocused = (key) => store.focus === key && store.chainBy !== null;

  const lightItem = (key) => ({ _: base(), [base()]: key });

  return (
    <Show
      when={store.recordSet.length}
      fallback={<span>press "new" in the top right corner to add entries</span>}
    >
      <For each={store.recordSet}>
        {(key, keyIndex) => (
          <div>
            {/* ego causes: shown above the focused record */}
            <Show when={isFocused(key)}>
              <For each={store.egoCauses}>
                {(causeKey, causeIndex) => (
                  <div className={chainClasses("cause-satellite")}>
                    <OverviewItemLight
                      index={`ego_cause_${keyIndex()}_${causeIndex()}`}
                      item={lightItem(causeKey)}
                      chainRole="cause-satellite"
                      actionLabel="."
                      onSelect={() => setFocus(context, causeKey)}
                    />
                  </div>
                )}
              </For>
            </Show>

            {/* the record itself */}
            <div
              className={isFocused(key) ? chainClasses("cause-nucleus") : ""}
            >
              <OverviewItem index={`feed_${keyIndex()}`} item={key} />
            </div>

            {/* ego results: shown below the focused record */}
            <Show when={isFocused(key)}>
              <For each={store.egoResults}>
                {(resultKey, resultIndex) => (
                  <div className={chainClasses("result-satellite")}>
                    <OverviewItemLight
                      index={`ego_result_${keyIndex()}_${resultIndex()}`}
                      item={lightItem(resultKey)}
                      chainRole="result-satellite"
                      actionLabel="."
                      onSelect={() => setFocus(context, resultKey)}
                    />
                  </div>
                )}
              </For>
            </Show>
          </div>
        )}
      </For>
    </Show>
  );
}
