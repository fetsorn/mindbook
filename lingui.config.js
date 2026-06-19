import { defineConfig } from "@lingui/solid/config";

export default defineConfig({
  locales: ["en", "ar"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "src/locales/{locale}",
      include: ["src"],
      exclude: ["**/__screenshots__/**"],
    },
  ],
});
