import { test, expect } from "@playwright/test";
test("complete all three rounds, persist progress, and replay", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Let’s play together" }).click();
  await expect(page.locator(".game-canvas")).toHaveAttribute("data-ready", "true");
  await page.getByText("Use keyboard or simple matching controls").click();
  for (let r = 0; r < 3; r++) {
    for (const c of ["red", "blue", "yellow"]) {
      await page
        .getByRole("button", { name: `Match ${c}`, exact: true })
        .click();
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
  await page.getByRole("button", { name: "Play again", exact: true }).click();
  await expect(page.getByText("0 / 9 flowers")).toBeVisible();
  await page.getByRole("button", { name: "My world", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Where shall we play today?" }),
  ).toBeVisible();
});
test("drag wrong basket then match correctly without penalty", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Let’s play together" }).click();
  const canvas = page.locator("canvas");
  await expect(page.locator(".game-canvas")).toHaveAttribute("data-ready", "true");
  const box = (await canvas.boundingBox())!;
  const point = (x: number, y: number) => ({
    x: box.x + (x / 1000) * box.width,
    y: box.y + (y / 600) * box.height,
  });
  await page.mouse.move(point(360, 280).x, point(360, 280).y);
  await page.mouse.down();
  await page.mouse.move(point(590, 480).x, point(590, 480).y, { steps: 10 });
  await page.mouse.up();
  await expect(
    page.getByText("Let’s try another basket. You can do it!"),
  ).toBeVisible();
  await expect(page.getByText("0 / 9 flowers")).toBeVisible();
  await page.waitForTimeout(350);
  await page.mouse.click(point(360, 280).x, point(360, 280).y);
  await page.mouse.click(point(360, 480).x, point(360, 480).y);
  await expect(page.getByText("1 / 9 flowers")).toBeVisible();
});
test("parent gate and deletion", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Grown-ups" }).click();
  await page.getByLabel("Your answer").fill("1");
  await page.getByRole("button", { name: "Open parent area" }).click();
  await expect(page.getByText("Please try again.", {exact:true})).toBeVisible();
  await page.getByLabel("Your answer").fill("42");
  await page.getByRole("button", { name: "Open parent area" }).click();
  await expect(page.getByLabel("Play session limit")).toBeVisible();
  await page.getByLabel("Play session limit").selectOption("10");
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("tiggy-limit")))
    .toBe("10");
  await page
    .getByRole("button", { name: "Delete learning progress on this device" })
    .click();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("tiggy-progress")))
    .toBeNull();
});

test('mobile touch controls and muted bundled audio', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Touch-specific mobile check');
  await page.goto('/');
  await page.getByRole('button', { name: 'Mute sound' }).click();
  await page.getByRole('button', { name: 'Let’s play together' }).click();
  const canvas = page.locator('canvas');
  await expect(page.locator(".game-canvas")).toHaveAttribute("data-ready", "true");
  const box = (await canvas.boundingBox())!;
  await page.touchscreen.tap(box.x + box.width * .36, box.y + box.height * 280/600);
  await page.touchscreen.tap(box.x + box.width * .36, box.y + box.height * 481/600);
  await expect(page.getByText('1 / 9 flowers')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Turn sound on' })).toBeVisible();
  const audio = await page.request.get('/assets/audio/intro.wav');
  expect(audio.ok()).toBeTruthy();
  expect((await audio.body()).length).toBeGreaterThan(1000);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});
