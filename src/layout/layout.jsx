import history from "history/hash";
import { onMount, useContext } from "solid-js";
import { MetaProvider, Title } from "@solidjs/meta";
import { useApi } from "@/context.js";
import { onMindChange } from "@/store/store.js";
import { QueryContext, queryStore } from "@/query/store.js";
import { ProxyContext, proxyStore, onStartup } from "@/proxy/store.js";
import {
  NavigationRevert,
  NavigationSave,
  NavigationMenu,
} from "./navigation/index.js";
import {
  BottomCount,
  BottomLoader,
  BottomNew,
  BottomSync,
} from "./bottom/index.js";
import { Overview } from "./overview/overview.jsx";
import { Profile } from "./profile/profile.jsx";
import styles from "./layout.module.css";

export function LayoutOverview() {
  const { store } = useContext(QueryContext);

  return (
    <div
      className={
        styles.window + " " + (store.record !== undefined ? styles.closed : "")
      }
    >
      <nav
        className={
          styles.buttonbar +
          " " +
          (__BUILD_MODE__ === "android" ? styles.buttonbarbig : "")
        }
        title="navigationOverview"
      >
        <NavigationMenu />
      </nav>

      <Overview />

      <footer
        className={
          styles.bottom +
          " " +
          (__BUILD_MODE__ === "android" ? styles.bottombig : "")
        }
      >
        <BottomCount />

        <BottomSync />

        <BottomLoader />

        <BottomNew />
      </footer>
    </div>
  );
}

export function LayoutProfile() {
  const { store: queryStore } = useContext(QueryContext);
  const { store: proxyStore } = useContext(ProxyContext);

  return (
    <Show when={queryStore.record !== undefined} fallback={<></>}>
      <div
        className={
          styles.window +
          " " +
          (queryStore.record === undefined ? styles.closed : "")
        }
      >
        <nav
          className={
            styles.buttonbar +
            " " +
            (__BUILD_MODE__ === "android" ? styles.buttonbarbig : "")
          }
          title="navigationProfile"
        >
          <NavigationRevert />

          <NavigationSave />
        </nav>

        <Profile />
      </div>
    </Show>
  );
}

export function App() {
  const api = useApi();

  onMount(async () => {
    await onStartup(api);

    await onMindChange(api, history.location.pathname, history.location.search);
  });

  return (
    <ProxyContext.Provider value={{ store: proxyStore }}>
      <QueryContext.Provider value={{ store: queryStore }}>
        <MetaProvider>
          <Title>{"evenor – " + queryStore.mind.name}</Title>
        </MetaProvider>

        <main className={styles.main}>
          <LayoutOverview />

          <LayoutProfile />
        </main>

        <span style={{ display: "none" }}>{__COMMIT_HASH__}</span>
      </QueryContext.Provider>
    </ProxyContext.Provider>
  );
}

export default App;
