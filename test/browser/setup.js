import mindbook from "../../dist/mindbook.js";
import { makeApi, reset } from "../memory-store.js";
import schema from "../schema.json";

export async function setup() {
  // prepare root element
  let root = document.getElementById("root");
  if (!root) {
    root = document.createElement("div");
    root.id = "root";
    root.className = "root";
    document.body.appendChild(root);
  }

  const api = makeApi();

  const book = await mindbook.create(api);

  book.open({
    schema,
    searchParams: "_=mind",
    template: {},
    actions: [],
  });

  book.bind(root);
}

export function cleanup() {
  reset();
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = "";
  }
}
