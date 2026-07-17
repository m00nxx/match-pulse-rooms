import fs from "node:fs";
import path from "node:path";

import { chromium } from "@playwright/test";

const appUrl =
  process.env.DEMO_APP_URL || "https://match-pulse-rooms.vercel.app";
const fixtureId = process.env.DEMO_FIXTURE_ID || "";
const outputDir = path.resolve("artifacts/demo");
const rawDir = path.join(outputDir, "raw");

fs.mkdirSync(rawDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: "dark",
  recordVideo: {
    dir: rawDir,
    size: { width: 1600, height: 900 },
  },
});
const page = await context.newPage();
const pause = (milliseconds) => page.waitForTimeout(milliseconds);
const reveal = async (locator, milliseconds = 4_000) => {
  await locator.scrollIntoViewIfNeeded();
  await pause(milliseconds);
};

await page.goto(appUrl, { waitUntil: "networkidle", timeout: 60_000 });
await page.evaluate(() => {
  window.localStorage.clear();
  window.scrollTo({ top: 0, behavior: "instant" });
});
await pause(5_000);

const whyPulse = page.getByRole("button", { name: "Why this Pulse?" });
await reveal(whyPulse, 2_000);
if ((await whyPulse.getAttribute("aria-expanded")) === "true") {
  await whyPulse.click();
  await pause(800);
}
await whyPulse.click();
await pause(6_000);

const playReplay = page.getByRole("button", { name: "Play replay" });
await playReplay.click();
await pause(11_000);

const brazilCall = page.getByRole("radio", { name: "Brazil" });
await reveal(brazilCall, 3_000);
await brazilCall.click();
await pause(5_000);

await reveal(
  page.getByRole("heading", { name: "Same match, different read." }),
  7_000,
);

const decisiveMoment = page.getByRole("button", {
  name: "Jump to 78 minutes: Goal · Brazil",
});
await reveal(decisiveMoment, 3_000);
await decisiveMoment.click();
await pause(7_000);

await reveal(
  page.getByRole("heading", { name: "One signal engine. Many rooms to own." }),
  7_000,
);

const openLive = page.getByRole("button", { name: "Open TxLINE Live" });
await reveal(openLive, 4_000);
await openLive.click();
await page.waitForLoadState("networkidle");
await pause(5_000);

const fixtureInput = page.getByLabel("TxLINE fixture ID");
if (!(await fixtureInput.inputValue()) && fixtureId) {
  await fixtureInput.fill(fixtureId);
}

const loadFixture = page.getByRole("button", { name: "Load", exact: true });
if (await loadFixture.isEnabled()) {
  await loadFixture.click();
  await pause(11_000);
}

await page.mouse.move(1220, 430);
await pause(6_000);

const video = page.video();
await context.close();
await browser.close();

if (!video) {
  throw new Error("Playwright did not create a recording");
}

const rawPath = await video.path();
const stablePath = path.join(outputDir, "match-pulse-raw.webm");
fs.copyFileSync(rawPath, stablePath);
console.log(stablePath);
