import { useContext } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context, onRecordEdit, branchTitle } from "@/store/store.js";
import { rhetoric } from "@/style/rhetoric.js";
import {
  Spoiler,
  URLPreview,
  isURL,
  isShowable,
} from "@/layout/components/index.js";
import styles from "./edit_value.module.css";

// https://css-tricks.com/auto-growing-inputs-textareas/
function calcSize(value, textarea) {
  const defaultWidth = 50;

  const defaultHeight = 14;

  const defaultCalc = {
    height: `${defaultHeight}px`,
    width: `${defaultWidth}px`,
  };

  // we will need parent's width later
  const noParent = textarea === undefined || textarea.parentElement === null;

  // if no value or parent, return default size
  if (value === undefined || noParent) return defaultCalc;

  const parentWidth = textarea.parentElement.getBoundingClientRect().width;

  const style = window
    .getComputedStyle(textarea, null)
    .getPropertyValue("font-size");

  const fontSize = parseFloat(style);

  // a letter is thinner than its font size
  const characterWidth = Math.round(fontSize * 0.65);

  // approximate how many characters can parent element fit
  const parentLength = Math.round(parentWidth / characterWidth);

  // for some reason first newline is \\n and all subsequent are \n
  // probably broken until newline escape in csvs is fixed
  const lines = value.split(/[\n\r]/);

  // find max length
  // if any single line is longer than parent width,
  // divide line length by parent width
  // and add height to contain wrapped text
  const { longest, breaks } = lines.reduce(
    (withLine, line) => {
      const longest = Math.max(line.length, withLine.longest);

      const wrap = Math.floor(longest / parentLength);

      const breaks = withLine.breaks + 1 + wrap;

      return { longest, breaks };
    },
    { longest: 0, breaks: 0 },
  );

  // number-of-characters x character-width
  const lineWidth = longest * characterWidth;

  const textareaWidth = Math.max(lineWidth, defaultWidth);

  const textareaHeight = breaks * fontSize;

  return {
    height: `${textareaHeight}px`,
    width: `${textareaWidth}px`,
  };
}

export function EditValue(props) {
  const context = useContext(Context);
  const { store } = context;
  const { i18n, t } = useLingui();

  const editClasses = () => rhetoric({ isEditing: true }).join(" ");

  const showPreview = () => isURL(props.value) && isShowable(props.value);

  let textarea;

  return (
    <>
      <label for={`profile-${props.branch}`}>
        {branchTitle(store.schema, props.branch, i18n().locale)} -{" "}
      </label>

      <textarea
        id={`profile-${props.branch}`}
        onInput={async (event) => {
          const { selectionStart, selectionEnd, selectionDirection } =
            event.currentTarget;

          await onRecordEdit(context, props.path, event.target.value);

          event.currentTarget.value = props.value;

          // https://github.com/solidjs/solid/discussions/416#discussioncomment-6833805
          //event.currentTarget.setSelectionRange(
          //  selectionStart,
          //  selectionEnd,
          //  selectionDirection || "none",
          //);
        }}
        className={editClasses()}
        ref={textarea}
        style={calcSize(props.value, textarea)}
      >
        {props.value}
      </textarea>

      <Show when={showPreview()}>
        <Spoiler title={t`like`}>
          <URLPreview url={props.value} />
        </Spoiler>
      </Show>
    </>
  );
}
