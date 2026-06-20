import { useContext, onCleanup } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context, getBase, getRecord, setFocus } from "@/store/store.js";
import { rhetoric } from "@/style/rhetoric.js";
import { ItemLight, ItemFull } from "./components/index.js";
import styles from "./item.module.css";

// A single feed item with IntersectionObserver-driven hydration
// and ego neighbourhood (causes above, results below) when focused.

function FeedItem(props) {
  const context = useContext(Context);
  const { store } = context;
  const { t } = useLingui();

  const base = () => getBase({ store });

  const grain = () => ({ _: base(), [base()]: props.item });

  let el;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !store.recordMap[props.item]) {
          getRecord(context, props.item);
          observer.disconnect();
        }
      }
    },
    { rootMargin: "200px" },
  );

  function setRef(node) {
    el = node;
    observer.observe(el);
  }

  onCleanup(() => observer.disconnect());

  return (
    <div id={props.item} className={styles.item} ref={setRef}>
      <Show
        when={store.recordMap[props.item]}
        fallback={
          <ItemLight
            index={props.index}
            item={grain()}
            onSelect={() => getRecord(context, props.item)}
            actionLabel={t`more...`}
          />
        }
      >
        <ItemFull
          index={props.index}
          item={store.recordMap[props.item]}
        />
      </Show>
    </div>
  );
}

export function Item(props) {
  const context = useContext(Context);
  const { store } = context;

  const base = () => getBase({ store });

  const chainClasses = (chainRole) => rhetoric({ chainRole }).join(" ");

  const isFocused = () => store.focus === props.item && store.chainBy !== null;

  const lightItem = (key) => ({ _: base(), [base()]: key });

  return (
    <div>
      {/* ego causes: shown above the focused record */}
      <Show when={isFocused()}>
        <For each={store.egoCauses}>
          {(causeKey, causeIndex) => (
            <div className={chainClasses("cause-satellite")}>
              <Show
                when={store.recordMap[causeKey]}
                fallback={
                  <ItemLight
                    index={`ego_cause_${props.keyIndex}_${causeIndex()}`}
                    item={lightItem(causeKey)}
                    chainRole="cause-satellite"
                    actionLabel="."
                    onSelect={() => setFocus(context, causeKey)}
                  />
                }
              >
                <ItemFull
                  index={`ego_cause_${props.keyIndex}_${causeIndex()}`}
                  item={store.recordMap[causeKey]}
                />
              </Show>
            </div>
          )}
        </For>
      </Show>

      {/* the record itself */}
      <div className={isFocused() ? chainClasses("cause-nucleus") : ""}>
        <FeedItem index={props.index} item={props.item} />
      </div>

      {/* ego results: shown below the focused record */}
      <Show when={isFocused()}>
        <For each={store.egoResults}>
          {(resultKey, resultIndex) => (
            <div className={chainClasses("result-satellite")}>
              <Show
                when={store.recordMap[resultKey]}
                fallback={
                  <ItemLight
                    index={`ego_result_${props.keyIndex}_${resultIndex()}`}
                    item={lightItem(resultKey)}
                    chainRole="result-satellite"
                    actionLabel="."
                    onSelect={() => setFocus(context, resultKey)}
                  />
                }
              >
                <ItemFull
                  index={`ego_result_${props.keyIndex}_${resultIndex()}`}
                  item={store.recordMap[resultKey]}
                />
              </Show>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
}
