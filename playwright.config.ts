import { defineConfig } from "@playwright/test";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const testDirectUrl = process.env.TEST_DIRECT_URL ?? testDatabaseUrl;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  use: { baseURL: "http://localhost:3001", trace: "retain-on-failure" },
  webServer: {
    command: "npx next dev --port 3001",
    port: 3001,
    reuseExistingServer: false,
    env: {
      ...process.env,
      NEXTAUTH_URL: "http://localhost:3001",
      NEXTAUTH_SECRET: "playwright-local-only-secret",
      ...(testDatabaseUrl && testDirectUrl
        ? { DATABASE_URL: testDatabaseUrl, DIRECT_URL: testDirectUrl }
        : {}),
    },
  },
});
