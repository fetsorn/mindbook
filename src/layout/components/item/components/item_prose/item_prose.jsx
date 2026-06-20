import { onCleanup, untrack } from "solid-js";
import { useEditor } from "solid-tiptap";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";

export function ItemProse(props) {
  let ref;

  // Capture initial value once — the editor owns its content after
  // creation; re-reading props.value would cause reactive loops
  // (onUpdate → setStore → re-render → new editor).
  const initialContent = untrack(() => props.value ?? "");

  const editor = useEditor(() => ({
    element: ref,
    extensions: [StarterKit, Markdown],
    content: initialContent,
    editable: props.editing ?? false,
    onUpdate({ editor: e }) {
      props.onInput?.(e.storage.markdown.getMarkdown());
    },
  }));

  onCleanup(() => {
    const e = editor();
    if (e) e.destroy();
  });

  return (
    <div>
      <label>{props.label} </label>
      <div ref={ref} />
    </div>
  );
}
