import { useContext } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context, onRecordEdit, onRecordSave } from "@/store/store.js";
import {
  OverviewFilter,
  OverviewHeader,
  OverviewChainFeed,
  ItemRecord,
} from "./components/index.js";
import styles from "./overview.module.css";

export function Overview() {
  const { store, setStore, api } = useContext(Context);
  const { t } = useLingui();

  // A new record being created — store.record exists but its key
  // is not in the current recordSet (it hasn't been saved yet).
  const isNewRecord = () =>
    store.record !== undefined &&
    !store.recordSet.includes(store.record[store.record._]);

  const isEditing = () => store.record !== undefined;

  return (
    <>
      <div className={isEditing() ? styles.disabled : ""}>
        <OverviewHeader />

        <OverviewFilter />
      </div>

      <div className={styles.container}>
        <Show when={isNewRecord()}>
          <div className={styles.newRecord}>
            <ItemRecord
              index="new-record"
              record={store.record}
              path={["record"]}
              isOpenDefault={true}
              editing={true}
            />

            <div className={styles.newRecordActions}>
              <button
                onClick={() =>
                  onRecordSave({ store, setStore, api }, store.record, store.record)
                }
              >
                {t`save`}
              </button>

              <button
                onClick={() => onRecordEdit({ setStore }, ["record"], undefined)}
              >
                {t`revert`}
              </button>
            </div>
          </div>
        </Show>

        <div className={
          styles.items +
          (store.record !== undefined ? " " + styles.itemsDisabled : "")
        }>
          {/* always an overview of chains of items: with no chainBy
              every record is its own singleton chain (a flat feed) */}
          <OverviewChainFeed />
        </div>
      </div>
    </>
  );
}
