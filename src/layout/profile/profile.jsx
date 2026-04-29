import { useContext } from "solid-js";
import { QueryContext } from "@/query/store.js";
import { ProfileRecord } from "./components/index.js";
import styles from "./profile.module.css";

export function Profile() {
  const { store } = useContext(QueryContext);

  return (
    <div className={styles.profile}>
      <ProfileRecord
        index="_"
        record={store.record}
        path={["record"]}
        isOpenDefault={true}
      />
    </div>
  );
}
