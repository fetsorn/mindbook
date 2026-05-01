import { useContext } from "solid-js";
import { Context, getBase } from "@/store/store.js";
import { OverviewItemLight, OverviewItemFull } from "../index.js";
import styles from "./overview_item.module.css";

export function OverviewItem(props) {
  const { store } = useContext(Context);

  const base = getBase({ store });

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
