import history from "history/hash";
import { onMount, useContext } from "solid-js";
import { MetaProvider, Title } from "@solidjs/meta";
import { Context } from "@/store/store.js";
import {
  NavigationMenu,
} from "./navigation/index.js";
import {
  BottomCount,
  BottomLoader,
  BottomNew,
  BottomSync,
} from "./bottom/index.js";
import { Overview } from "./overview/overview.jsx";
import styles from "./layout.module.css";

export function LayoutOverview() {
  const { store } = useContext(Context);

  const isEditing = () => store.record !== undefined;

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
        <NavigationMenu />
      </nav>

      <Overview />

      <footer
        className={
          styles.bottom +
          " " +
          (__BUILD_MODE__ === "android" ? styles.bottombig : "") +
          (isEditing() ? " " + styles.disabled : "")
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

export function App() {
  const { store } = useContext(Context);

  // TODO onSearch onMount if config true

  return (
    <>
      <MetaProvider>
        <Title>{store.title}</Title>
      </MetaProvider>

      <main className={styles.main}>
        <LayoutOverview />
      </main>

      <span style={{ display: "none" }}>{__COMMIT_HASH__}</span>
    </>
  );
}

export default App;
