import { useContext, onCleanup } from "solid-js";
import { Context, getBase, getRecord } from "@/store/store.js";
import { OverviewItemLight, OverviewItemFull } from "../index.js";
import styles from "./overview_item.module.css";

export function OverviewItem(props) {
  const context = useContext(Context);
  const { store } = context;

  const base = getBase({ store });

  const grain = { _: base, [base]: props.item };

  // Auto-hydrate when the item scrolls into view.
  // Once hydrated (recordMap has the key), the observer
  // disconnects — no further work for this element.
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
          <OverviewItemLight
            index={props.index}
            item={grain}
            onSelect={() => getRecord(context, props.item)}
            actionLabel="more..."
          />
        }
      >
        <OverviewItemFull
          index={props.index}
          item={store.recordMap[props.item]}
        />
      </Show>
    </div>
  );
}
