import { useContext, onCleanup, untrack } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { useEditor } from "solid-tiptap";
import Document from "@tiptap/extension-document";
import Text from "@tiptap/extension-text";
import Paragraph from "@tiptap/extension-paragraph";
import { Context, onRecordEdit, branchTitle } from "@/store/store.js";
import { rhetoric } from "@/style/rhetoric.js";
import {
  Spoiler,
  Preview,
  isURL,
  isShowable,
} from "@/layout/components/index.js";
import styles from "./item_value_edit.module.css";

export function ItemValueEdit(props) {
  const context = useContext(Context);
  const { store } = context;
  const { i18n, t } = useLingui();

  const editClasses = () => rhetoric({ isEditing: true }).join(" ");

  const showPreview = () => isURL(props.value) && isShowable(props.value);

  const initialContent = untrack(() => props.value ?? "");

  let ref;

  const editor = useEditor(() => ({
    element: ref,
    extensions: [Document, Text, Paragraph],
    content: initialContent,
    editable: true,
    onUpdate({ editor: e }) {
      onRecordEdit(context, props.path, e.getText());
    },
  }));

  onCleanup(() => {
    const e = editor();
    if (e) e.destroy();
  });

  return (
    <>
      <label>
        {branchTitle(store.schema, props.branch, i18n().locale)} -{" "}
      </label>

      <span className={editClasses()}>
        <span ref={ref} />
      </span>

      <Show when={showPreview()}>
        <Spoiler title={t`like`}>
          <Preview url={props.value} />
        </Spoiler>
      </Show>
    </>
  );
}
