import { createContext } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { createRoot } from "@/proxy/record.js";

export const ProxyContext = createContext();

export const [proxyStore, setProxyStore] = createStore({
  abortPreviousStream: async () => {},
  mergeResult: false,
  syncError: undefined,
});

/**
 * This
 * @name onStartup
 * @export function
 */
export async function onStartup(api) {
  await createRoot(api);
}
