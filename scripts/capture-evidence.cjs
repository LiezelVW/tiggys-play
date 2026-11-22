/* Run against npm run start -- --port 3101. Fresh browser contexts contain no family data. */
const { chromium, webkit, devices } = require("@playwright/test");
const { mkdir } = require("node:fs/promises");
const titles = {
  builders: "Little Builders",
  railway: "Tiggy’s Railway",
  science: "Science Lab",
  ready: "Ready, Set, Go!",
  blocks: "Build & Solve",
  ferris: "Ferris Wheel",
  breakfast: "Benny Bear’s Breakfast",
  potty: "Potty Time",
};
(async () => {
  await mkdir("docs/screenshots", { recursive: true });
  for (const [name, engine, opts] of [
    ["desktop", chromium, { viewport: { width: 1440, height: 1000 } }],
    ["tablet", chromium, devices["iPad (gen 7)"]],
    ["mobile", webkit, devices["iPhone 13"]],
  ]) {
    const browser = await engine.launch(),
      page = await browser.newPage(opts);
    const activate = (locator) =>
      opts.hasTouch ? locator.tap() : locator.click();
    await page.goto("http://localhost:3101");
    await page.getByRole("dialog").waitFor();
    await page.screenshot({ path: `docs/screenshots/loading-${name}.png` });
    await activate(
      page.getByRole("button", { name: "Let’s play", exact: true }),
    );
    await page.getByRole("dialog").waitFor({ state: "detached" });
    await page.screenshot({ path: `docs/screenshots/world-${name}.png` });
    for (const [id, title] of Object.entries(titles)) {
      await activate(
        page.getByRole("button", { name: `Open ${title}`, exact: true }),
      );
      await page
        .locator('.game-canvas[data-ready="true"] canvas[data-tiggy-frame]')
        .waitFor();
      await page.screenshot({
        path: `docs/screenshots/${id}-${name}.png`,
        fullPage: true,
      });
      await activate(
        page.getByRole("button", { name: "My world", exact: true }),
      );
    }
    await activate(
      page.getByRole("button", { name: "Play Colour Garden", exact: true }),
    );
    await page
      .locator('.game-canvas[data-ready="true"] canvas[data-tiggy-frame]')
      .waitFor();
    await page.screenshot({
      path: `docs/screenshots/garden-${name}.png`,
      fullPage: true,
    });
    await activate(page.getByRole("button", { name: "My world", exact: true }));
    await activate(
      page
        .getByRole("button", { name: "Play Monster Truck Mayhem", exact: true })
        .first(),
    );
    await page
      .locator('.game-canvas[data-ready="true"] canvas[data-tiggy-frame]')
      .waitFor();
    await page.screenshot({
      path: `docs/screenshots/trucks-${name}.png`,
      fullPage: true,
    });
    await activate(
      page.getByRole("button", { name: "Choose red truck", exact: true }),
    );
    await activate(page.getByRole("button", { name: "GO!", exact: true }));
    await page.waitForTimeout(650);
    await page.screenshot({
      path: `docs/screenshots/driving-${name}.png`,
      fullPage: true,
    });
    await activate(page.getByRole("button", { name: "My world", exact: true }));
    await activate(
      page.getByRole("button", { name: "Grown-ups", exact: true }),
    );
    await page.getByLabel("Your answer").fill("42");
    await activate(
      page.getByRole("button", { name: "Open parent area", exact: true }),
    );
    await activate(
      page.getByRole("button", {
        name: "Voice preview & approval",
        exact: true,
      }),
    );
    await page.screenshot({
      path: `docs/screenshots/voice-studio-${name}.png`,
    });
    await activate(
      page.getByRole("button", { name: "Close voice studio", exact: true }),
    );
    await activate(
      page.getByRole("button", { name: "Record Tiggy’s voice", exact: true }),
    );
    await page.screenshot({ path: `docs/screenshots/recorder-${name}.png` });
    await browser.close();
    console.log(
      `${name}: loading, world, all games and parent audio captured.`,
    );
  }
  const browser = await chromium.launch(),
    context = await browser.newContext({
      viewport: { width: 1280, height: 960 },
      recordVideo: {
        dir: "/private/tmp/tiggy-live-evidence",
        size: { width: 1280, height: 960 },
      },
    }),
    page = await context.newPage();
  await page.goto("http://localhost:3101");
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: "Let’s play", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "detached" });
  await page.locator(".tiggy-character").focus();
  for (const [key, duration] of [
    ["Escape", 4200],
    ["w", 1600],
    ["ArrowRight", 1600],
    ["t", 1600],
    ["c", 1500],
    ["j", 1900],
    ["q", 1600],
    ["h", 1600],
    ["l", 1700],
  ]) {
    await page.keyboard.down(key);
    await page.waitForTimeout(duration);
    await page.keyboard.up(key);
  }
  const video = page.video();
  await context.close();
  await video.saveAs("docs/screenshots/tiggy-live-actions.webm");
  await browser.close();
  console.log(
    "Saved silent recording of the actual animated gameplay character.",
  );
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
