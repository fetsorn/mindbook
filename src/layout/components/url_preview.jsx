import { createSignal, onMount } from "solid-js";

const showableExts = new Set([
  // image
  "png", "jpg", "jpeg", "gif", "svg", "webp", "bmp", "ico",
  // video
  "mp4", "webm", "mov", "m4v",
  // audio
  "mp3", "ogg", "m4a", "flac", "aac", "wav",
  // document
  "pdf",
]);

function extFromURL(value) {
  try {
    const pathname = new URL(value).pathname;
    const match = pathname.match(/\.([^.]+)$/);
    return match ? match[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

export function isURL(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isShowable(value) {
  const ext = extFromURL(value);
  return ext !== null && showableExts.has(ext);
}

function mimeFromExt(ext) {
  const map = {
    png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
    gif: "image/gif", svg: "image/svg+xml", webp: "image/webp",
    bmp: "image/bmp", ico: "image/x-icon",
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
    m4v: "video/x-m4v",
    mp3: "audio/mpeg", ogg: "audio/ogg", m4a: "audio/mp4",
    flac: "audio/flac", aac: "audio/aac", wav: "audio/wav",
    pdf: "application/pdf",
  };
  return map[ext] ?? "application/octet-stream";
}

export function URLPreview(props) {
  const [src, setSrc] = createSignal(undefined);
  const [mime, setMime] = createSignal("");

  onMount(async () => {
    const ext = extFromURL(props.url);
    const m = mimeFromExt(ext);
    setMime(m);

    if (m.startsWith("image/") || m.startsWith("audio/") || m.startsWith("video/")) {
      // browser can embed these directly from the URL
      setSrc(props.url);
    } else {
      // fetch and convert to blob (pdf, unknown)
      try {
        const resp = await fetch(props.url);
        const blob = await resp.blob();
        setSrc(URL.createObjectURL(new Blob([blob], { type: m })));
      } catch {
        // fall back to direct URL
        setSrc(props.url);
      }
    }
  });

  return (
    <Show when={src()} fallback={<span>loading...</span>}>
      <Switch fallback={
        <iframe title="preview" width="100%" height="400" src={src()} />
      }>
        <Match when={mime().startsWith("image/")}>
          <img alt="preview" width="100%" src={src()} />
        </Match>
        <Match when={mime().startsWith("audio/")}>
          <audio controls>
            <track kind="captions" />
            <source src={src()} type={mime()} />
          </audio>
        </Match>
        <Match when={mime().startsWith("video/")}>
          <video width="100%" controls>
            <track kind="captions" />
            <source src={src()} type={mime()} />
          </video>
        </Match>
        <Match when={mime() === "application/pdf"}>
          <iframe title="preview" width="100%" height="1000" src={src()} />
        </Match>
      </Switch>
    </Show>
  );
}
