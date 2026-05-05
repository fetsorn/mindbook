import history from "history/hash";
import { onMount, useContext } from "solid-js";
import { MetaProvider, Title } from "@solidjs/meta";
import { Context } from "@/store/store.js";
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
  const { store } = useContext(Context);

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
  const { store } = useContext(Context);

  return (
    <Show when={store.record !== undefined} fallback={<></>}>
      <div
        className={
          styles.window +
          " " +
          (store.record === undefined ? styles.closed : "")
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
  const { store } = useContext(Context);

  // TODO onSearch onMount if config true

  return (
    <>
      <MetaProvider>
        <Title>{"evenor – " + store.title}</Title>
      </MetaProvider>

      <main className={styles.main}>
        <LayoutOverview />

        <LayoutProfile />
      </main>

      <span style={{ display: "none" }}>{__COMMIT_HASH__}</span>
    </>
  );
}

export default App;
