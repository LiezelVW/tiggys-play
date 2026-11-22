import { test, expect } from "./fixtures";
import { activate } from "./input";
test("loading screen: supplied logo, real asset progress, music gesture and working world", async ({
  page,
}) => {
  const failures: string[] = [];
  page.on("response", (r) => {
    if (r.status() >= 400 && r.url().includes("/assets/"))
      failures.push(r.url());
  });
  await page.route("**/assets/world/colour-garden-flat.webp", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 650));
    await route.continue();
  });
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: "Play • Learn • Grow" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("img", { name: "Tiggy’s Kids", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Grown-ups" })).toHaveCount(0);
  await activate(
    dialog.getByRole("button", { name: "Let’s play", exact: true }),
  );
  await expect(
    page.getByRole("progressbar", { name: "Adventure loading progress" }),
  ).toBeVisible();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("main", { name: "Tiggy’s adventure playground" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => sessionStorage.getItem("tiggy-entered-session")),
  ).toBe("1");
  expect(failures).toEqual([]);
  await activate(
    page.getByRole("button", { name: "Play Colour Garden", exact: true }),
  );
  await expect(page.locator('.game-canvas[data-ready="true"]')).toBeVisible();
});
