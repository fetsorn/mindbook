import { useContext } from "solid-js";
import { QueryContext, getBase } from "@/query/store.js";
import { OverviewItemLight, OverviewItemFull } from "../index.js";
import styles from "./overview_item.module.css";

export function OverviewItem(props) {
  const { store } = useContext(QueryContext);

  const base = getBase();

  const grain = { _: base, [base]: props.item };

  return (
    <div id={props.item} className={styles.item}>
      <Show
        when={store.recordMap[props.item]}
        fallback={<OverviewItemLight index={props.index} item={grain} />}
      >
        <OverviewItemFull
          index={props.index}
          item={store.recordMap[props.item]}
        />
      </Show>
    </div>
  );
}
