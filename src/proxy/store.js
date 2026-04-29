import { createContext } from "solid-js";
import { createStore, produce } from "solid-js/store";

export const ProxyContext = createContext();

export const [proxyStore, setProxyStore] = createStore({
  abortPreviousStream: async () => {},
  mind: { _: "mind", mind: "root", name: "minds" },
  mergeResult: false,
  syncError: undefined,
  streamCounter: 0,
});
