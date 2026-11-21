import { activate } from "./input";
import { test, expect } from "@playwright/test";
test("complete all three rounds, persist progress, and replay", async ({
  page,
}) => {
  await page.goto("/");
  await activate(page.getByRole("button", { name: "Play Colour Garden" }));
  await expect(page.locator(".game-canvas")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await activate(page.getByText("Use keyboard or simple matching controls"));
  for (let r = 0; r < 3; r++) {
    for (const c of ["red", "blue", "yellow"]) {
      await activate(
        page.getByRole("button", { name: `Match ${c}`, exact: true }),
      );
      await page.waitForTimeout(550);
    }
    if (r < 2)
      await expect(page.getByText(`Round ${r + 2} of 3`)).toBeVisible();
  }
  await expect(
    page.getByRole("heading", { name: "You helped the garden grow!" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("tiggy-progress") || "{}").completed,
      ),
    )
    .toBe(1);
  await activate(page.getByRole("button", { name: "Play again", exact: true }));
  await expect(page.getByText("0 / 9 flowers")).toBeVisible();
  await activate(page.getByRole("button", { name: "My world", exact: true }));
  await expect(
    page.getByRole("main", { name: "Tiggy’s adventure playground" }),
  ).toBeVisible();
});
test("wrong basket retry with mouse dragging or touch tapping", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  await activate(page.getByRole("button", { name: "Play Colour Garden" }));
  const canvas = page.locator("canvas");
  await expect(page.locator(".game-canvas")).toHaveAttribute(
    "data-ready",
    "true",
  );
  const box = (await canvas.boundingBox())!;
  const portrait =
    (await page.locator(".game-canvas").getAttribute("data-layout")) ===
    "portrait";
  const point = (x: number, y: number) => ({
    x:
      box.x +
      ((portrait ? (x === 360 ? 145 : 300) : x) / (portrait ? 600 : 1000)) *
        box.width,
    y:
      box.y +
      ((portrait ? (y === 280 ? 225 : 530) : y) / (portrait ? 650 : 600)) *
        box.height,
  });
  if (isMobile) {
    await page.touchscreen.tap(point(360, 280).x, point(360, 280).y);
    await page.waitForTimeout(80);
    await page.touchscreen.tap(point(590, 480).x, point(590, 480).y);
  } else {
    await page.mouse.move(point(360, 280).x, point(360, 280).y);
    await page.mouse.down();
    await page.mouse.move(point(590, 480).x, point(590, 480).y, { steps: 10 });
    await page.mouse.up();
  }
  await expect(
    page.getByText("Let’s try another basket. You can do it!"),
  ).toBeVisible();
  await expect(page.getByText("0 / 9 flowers")).toBeVisible();
  await page.waitForTimeout(350);
  if (isMobile) {
    await page.touchscreen.tap(point(360, 280).x, point(360, 280).y);
    await page.waitForTimeout(80);
    await page.touchscreen.tap(point(360, 480).x, point(360, 480).y);
  } else {
    await page.mouse.click(point(360, 280).x, point(360, 280).y);
    await page.mouse.click(point(360, 480).x, point(360, 480).y);
  }
  await expect(page.getByText("1 / 9 flowers")).toBeVisible();
});
test("parent gate and deletion", async ({ page }) => {
  await page.goto("/");
  await activate(page.getByRole("button", { name: "Grown-ups" }));
  await page.getByLabel("Your answer").fill("1");
  await activate(page.getByRole("button", { name: "Open parent area" }));
  await expect(
    page.getByText("Please try again.", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Your answer").fill("42");
  await activate(page.getByRole("button", { name: "Open parent area" }));
  await expect(page.getByLabel("Play session limit")).toBeVisible();
  await page.getByLabel("Play session limit").selectOption("10");
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("tiggy-limit")))
    .toBe("10");
  await activate(
    page.getByRole("button", {
      name: "Delete learning progress on this device",
    }),
  );
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("tiggy-progress")))
    .toBeNull();
});

test("mobile touch controls and muted bundled audio", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Touch-specific mobile check");
  await page.goto("/");
  await activate(page.getByRole("button", { name: "Mute sound" }));
  await activate(page.getByRole("button", { name: "Play Colour Garden" }));
  const canvas = page.locator("canvas");
  await expect(page.locator(".game-canvas")).toHaveAttribute(
    "data-ready",
    "true",
  );
  const box = (await canvas.boundingBox())!;
  const portrait =
    (await page.locator(".game-canvas").getAttribute("data-layout")) ===
    "portrait";
  await page.touchscreen.tap(
    box.x + box.width * (portrait ? 145 / 600 : 0.36),
    box.y + box.height * (portrait ? 225 / 650 : 280 / 600),
  );
  await page.touchscreen.tap(
    box.x + box.width * (portrait ? 145 / 600 : 0.36),
    box.y + box.height * (portrait ? 530 / 650 : 481 / 600),
  );
  await expect(page.getByText("1 / 9 flowers")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Turn sound on" }),
  ).toBeVisible();
  const audio = await page.request.get("/assets/audio/intro.wav");
  expect(audio.ok()).toBeTruthy();
  expect((await audio.body()).length).toBeGreaterThan(1000);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
