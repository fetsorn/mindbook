import { useContext, createMemo } from "solid-js";
import {
  Context,
  getBase,
  getChainGraph,
  getChainFoci,
  getChainNeighbours,
  onChainRecenter,
} from "@/store/store.js";
import { rhetoric } from "@/style/rhetoric.js";
import { OverviewItem, OverviewItemLight } from "../index.js";

// The overview, one abstraction up: an overview of chains of items.
//
// This renders always, whether or not a chain branch is chosen.
// With no chainBy there are no edges, so every record is its own
// singleton component -> a flat feed. With a chainBy chosen, each
// connected component collapses to one focus and its immediate
// neighbours.
//
// Everything is derived from recordSet + chainBy, so switching the
// chain branch re-derives from scratch (no accumulation).
export function OverviewChainFeed() {
  const context = useContext(Context);
  const { store } = context;

  const base = () => getBase({ store });

  const graph = createMemo(() => getChainGraph(context));

  const foci = createMemo(() => getChainFoci(context, graph()));

  const chainClasses = (chainRole) => rhetoric({ chainRole }).join(" ");

  const lightItem = (key) => ({ _: base(), [base()]: key });

  return (
    <Show
      when={foci().length}
      fallback={
        <span>press "new" in the top right corner to add entries</span>
      }
    >
      <For each={foci()}>
        {(focusKey, focusIndex) => {
          const near = () => getChainNeighbours(context, graph(), focusKey);

          return (
            <div>
              {/* causes: the records this focus points to */}
              <For each={near().causes}>
                {(causeKey, causeIndex) => (
                  <div className={chainClasses("cause-satellite")}>
                    <OverviewItemLight
                      index={`chain_cause_${focusIndex()}_${causeIndex()}`}
                      item={lightItem(causeKey)}
                      chainRole="cause-satellite"
                      actionLabel="choose"
                      onSelect={() =>
                        onChainRecenter(context, focusKey, causeKey)
                      }
                    />
                  </div>
                )}
              </For>

              {/* focus: the centered record */}
              <div className={chainClasses("cause-nucleus")}>
                <OverviewItem
                  index={`chain_focus_${focusIndex()}`}
                  item={focusKey}
                />
              </div>

              {/* results: through-nodes that point to this focus */}
              <For each={near().results}>
                {(resultKey, resultIndex) => (
                  <div className={chainClasses("result-satellite")}>
                    <OverviewItemLight
                      index={`chain_result_${focusIndex()}_${resultIndex()}`}
                      item={lightItem(resultKey)}
                      chainRole="result-satellite"
                      actionLabel="choose"
                      onSelect={() =>
                        onChainRecenter(context, focusKey, resultKey)
                      }
                    />
                  </div>
                )}
              </For>
            </div>
          );
        }}
      </For>
    </Show>
  );
}
