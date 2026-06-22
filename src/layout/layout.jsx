import history from "history/hash";
import { createEffect, onMount, useContext } from "solid-js";
import { MetaProvider, Title } from "@solidjs/meta";
import { useLingui } from "@lingui/solid/macro";
import { Context } from "@/store/store.js";
import {
  Menu,
  Filter,
  Header,
  Item,
  ItemFull,
  BottomCount,
  BottomNew,
  BottomStatus,
} from "./components/index.js";
import styles from "./layout.module.css";

export function Layout() {
  const { store } = useContext(Context);
  const { t } = useLingui();

  const isEditing = () => store.record !== undefined;

  // A new record being created — store.record exists but editingKey
  // is not in the current recordSet (it hasn't been saved yet).
  const isNewRecord = () =>
    isEditing() &&
    !store.recordSet.includes(store.editingKey);

  createEffect(() => {
    const key = store.focus;
    if (key === null) return;
    const el = document.getElementById(key);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  return (
    <div className={styles.window}>
      <nav
        className={
          styles.buttonbar +
          " " +
          (__BUILD_MODE__ === "android" ? styles.buttonbarbig : "") +
          (isEditing() ? " " + styles.disabled : "")
        }
        title="navigationOverview"
      >
        <Menu />
      </nav>

      <div className={isEditing() ? styles.disabled : ""}>
        <Header />

        <Filter />
      </div>

      <div className={styles.container}>
        <Show when={isNewRecord()}>
          <ItemFull
            index="new-record"
            item={store.record}
          />
        </Show>

        <div className={
          styles.items +
          (isEditing() ? " " + styles.itemsDisabled : "")
        }>
          <Show
            when={store.recordSet.length}
            fallback={<span>{t`press "new" in the top right corner to add entries`}</span>}
          >
            <For each={store.recordSet}>
              {(key, keyIndex) => (
                <Item
                  index={`feed_${keyIndex()}`}
                  item={key}
                  keyIndex={keyIndex()}
                />
              )}
            </For>
          </Show>
        </div>
      </div>

      <footer
        className={
          styles.bottom +
          " " +
          (__BUILD_MODE__ === "android" ? styles.bottombig : "") +
          (isEditing() ? " " + styles.disabled : "")
        }
      >
        <BottomCount />

        <BottomStatus />

        <BottomNew />
      </footer>
    </div>
  );
}

export function App() {
  const { store } = useContext(Context);

  // TODO onSearch onMount if config true

  return (
    <>
      <MetaProvider>
        <Title>{store.title}</Title>
      </MetaProvider>

      <main className={styles.main}>
        <Layout />
      </main>

      <span style={{ display: "none" }}>{__COMMIT_HASH__}</span>
    </>
  );
}

export default App;
