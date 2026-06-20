import { onCleanup, untrack } from "solid-js";
import { useEditor } from "solid-tiptap";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { Markdown } from "tiptap-markdown";
import styles from "./item_prose.module.css";

const lowlight = createLowlight(common);

export function ItemProse(props) {
  let ref;

  // Capture initial value once — the editor owns its content after
  // creation; re-reading props.value would cause reactive loops
  // (onUpdate → setStore → re-render → new editor).
  const initialContent = untrack(() => props.value ?? "");

  const editor = useEditor(() => ({
    element: ref,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Markdown,
    ],
    content: initialContent,
    editable: props.editing ?? false,
    editorProps: props.label
      ? { attributes: { "aria-label": props.label } }
      : {},
    onUpdate({ editor: e }) {
      props.onInput?.(e.storage.markdown.getMarkdown());
    },
  }));

  onCleanup(() => {
    const e = editor();
    if (e) e.destroy();
  });

  return (
    <span className={styles.prose}>
      <span ref={ref} />
    </span>
  );
}
