export const config = {
  specs: [["./test/browser/*.test.jsx"]],
  runner: ["browser", {}],
  capabilities: [
    {
      browserName: "chrome",
      "goog:chromeOptions": {
        binary: "/usr/bin/chromium-browser",
      },
      "wdio:chromedriverOptions": {
        binary: "/usr/bin/chromedriver",
      },
    },
  ],
  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: 6000000,
  },
  logLevel: "error",
  maxInstances: 1,
  reporters: ["spec"],
};
