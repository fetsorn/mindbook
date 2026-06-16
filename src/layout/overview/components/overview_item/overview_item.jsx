import { useContext } from "solid-js";
import { Context, getBase, getRecord } from "@/store/store.js";
import { OverviewItemLight, OverviewItemFull } from "../index.js";
import styles from "./overview_item.module.css";

export function OverviewItem(props) {
  const context = useContext(Context);
  const { store } = context;

  const base = getBase({ store });

  const grain = { _: base, [base]: props.item };

  return (
    <div id={props.item} className={styles.item}>
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
