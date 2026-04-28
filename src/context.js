import { createContext, useContext } from "solid-js";
const ApiContext = createContext();
export const ApiProvider = ApiContext.Provider;
export const useApi = () => useContext(ApiContext);
