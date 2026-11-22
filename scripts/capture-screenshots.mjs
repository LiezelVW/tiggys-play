import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
await mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch();
try {
  for (const [name, width, height] of [
    ["desktop", 1440, 1000],
    ["tablet", 1024, 1366],
    ["mobile", 390, 844],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(process.env.PREVIEW_URL || "http://localhost:3100");
    await page.locator(".world-loading").waitFor({ state: "hidden" });
    await page.screenshot({
      path: `docs/screenshots/world-${name}.png`,
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Play Monster Truck Mayhem", exact: true })
      .click();
    await page.locator('.game-canvas[data-ready="true"]').waitFor();
    await page.screenshot({
      path: `docs/screenshots/trucks-${name}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Choose red truck" }).click();
    await page.getByRole("button", { name: "GO!", exact: true }).click();
    await page.getByRole("button", { name: "GO!", exact: true }).click();
    await page.waitForTimeout(1100);
    await page.screenshot({
      path: `docs/screenshots/driving-${name}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "My world", exact: true }).click();
    await page
      .getByRole("button", { name: "Play Colour Garden", exact: true })
      .click();
    await page.locator('.game-canvas[data-ready="true"]').waitFor();
    await page.screenshot({
      path: `docs/screenshots/garden-${name}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "My world", exact: true }).click();
    for (const [id, title] of [
      ["builders", "Little Builders"],
      ["railway", "Tiggy’s Railway"],
      ["science", "Science Lab"],
      ["ready", "Ready, Set, Go!"],
      ["blocks", "Build & Solve"],
      ["ferris", "Ferris Wheel"],
      ["breakfast", "Benny Bear’s Breakfast"],
      ["potty", "Potty Time"],
    ]) {
      await page
        .getByRole("button", { name: `Open ${title}`, exact: true })
        .click();
      await page.locator('.game-canvas[data-ready="true"]').waitFor();
      await page.screenshot({
        path: `docs/screenshots/${id}-${name}.png`,
        fullPage: true,
      });
      await page.getByRole("button", { name: "My world", exact: true }).click();
    }
    await page.getByRole("button", { name: "Grown-ups" }).click();
    await page.getByLabel("Your answer").fill("42");
    await page.getByRole("button", { name: "Open parent area" }).click();
    await page
      .getByRole("button", { name: "Record Tiggy’s voice", exact: true })
      .click();
    await page.locator(".voice-recorder").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `docs/screenshots/recorder-${name}.png`,
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Close voice recorder", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Voice preview & approval", exact: true })
      .click();
    await page
      .locator(".voice-preview")
      .evaluate((el) => el.scrollIntoView({ block: "start" }));
    await page.screenshot({
      path: `docs/screenshots/voice-studio-${name}.png`,
      fullPage: true,
    });
    if (errors.length) throw Error(`${name}: ${errors.join(", ")}`);
    console.log(`${name}: fourteen rendered screenshots, no page errors`);
    await page.close();
  }
} finally {
  await browser.close();
}
