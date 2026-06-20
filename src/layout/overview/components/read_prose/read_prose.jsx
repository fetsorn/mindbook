import { onCleanup, untrack } from "solid-js";
import { useEditor } from "solid-tiptap";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";

export function ReadProse(props) {
  let ref;

  const initialContent = untrack(() => props.value ?? "");

  const editor = useEditor(() => ({
    element: ref,
    extensions: [StarterKit, Markdown],
    content: initialContent,
    editable: false,
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
