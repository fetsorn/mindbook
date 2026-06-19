/** @type {import('@lingui/conf').LinguiConfig} */
export default {
  locales: ["en"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "src/locales/{locale}/messages",
      include: ["src"],
    },
  ],
};
