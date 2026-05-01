import { useContext } from "solid-js";
import { Context, onRecordEdit } from "@/store/store.js";

export function NavigationRevert() {
  const context = useContext(Context);

  return (
    <button
      className="navigationRevert"
      title={""}
      onClick={() => onRecordEdit(context, ["record"], undefined)}
    >
      revert
    </button>
  );
}
