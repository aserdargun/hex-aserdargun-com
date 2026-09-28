import { defineConfig } from "@playwright/test";

const remoteURL = process.env.HEX_E2E_URL;
const baseURL = remoteURL || "http://127.0.0.1:5186";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  // The mode scan walks all ten modes in one test. On the GPU-less CI runner each
  // model decode runs on software rendering, so the per-test budget has to cover
  // ten loads rather than one.
  timeout: 15 * 60_000,
  expect: { timeout: 15_000 },
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    launchOptions: {
      args: [
        "--enable-webgl",
        "--use-gl=angle",
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
      ],
    },
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: remoteURL
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
