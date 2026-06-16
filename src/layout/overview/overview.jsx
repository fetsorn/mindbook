import {
  OverviewFilter,
  OverviewHeader,
  OverviewChainFeed,
} from "./components/index.js";
import styles from "./overview.module.css";

export function Overview() {
  return (
    <>
      <OverviewHeader />

      <OverviewFilter />

      <div className={styles.container}>
        <div className={styles.items}>
          {/* always an overview of chains of items: with no chainBy
              every record is its own singleton chain (a flat feed) */}
          <OverviewChainFeed />
        </div>
      </div>
    </>
  );
}
