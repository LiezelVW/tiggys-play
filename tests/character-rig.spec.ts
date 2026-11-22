import { test, expect } from "@playwright/test";
import { activate } from "./input";

test("original SVG is used; absent rig never requests missing files or an old character atlas", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.goto("/");
  const character = page.getByRole("button", { name: "Say hello to Tiggy" });
  await expect(character).toHaveAttribute(
    "data-character-renderer",
    "original-static",
  );
  await expect(character.locator("img")).toHaveAttribute(
    "src",
    "/assets/tiggy/original/tiggy_neutral_layered.svg",
  );
  expect(
    await character
      .locator("img")
      .evaluate((e) => (e as HTMLImageElement).naturalHeight),
  ).toBeGreaterThan(0);
  await activate(character);
  await activate(
    page.getByRole("button", { name: "Play Colour Garden", exact: true }),
  );
  await expect(page.locator('.game-canvas[data-ready="true"]')).toBeVisible();
  expect(requests.some((url) => url.includes("tiggy-actions"))).toBe(false);
  expect(requests.some((url) => /\.riv(?:\?|$)|rive\.wasm/.test(url))).toBe(
    false,
  );
});

test("parent rig lab reports its real status and safely rejects an invalid export", async ({
  page,
}) => {
  await page.goto("/character-lab");
  await page.getByLabel("Your answer").fill("1");
  await activate(page.getByRole("button", { name: "Open rig review" }));
  await expect(page.getByLabel("Open exported .riv file")).toHaveCount(0);
  await page.getByLabel("Your answer").fill("42");
  await activate(page.getByRole("button", { name: "Open rig review" }));
  await expect(page.getByRole("status")).toContainText(
    "No finished .riv export supplied",
  );
  for (const name of [
    "Idle",
    "Wave",
    "Walk",
    "Talk",
    "Celebrate",
    "Thinking",
    "Help",
    "Happy",
  ]) {
    await expect(
      page.getByRole("button", { name, exact: true }),
    ).toBeDisabled();
  }
  await page.getByLabel("Open exported .riv file").setInputFiles({
    name: "invalid.riv",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("not-a-rive-file"),
  });
  await expect(page.getByRole("status")).toContainText("Rig not accepted", {
    timeout: 20000,
  });
  await expect(
    page.locator('[data-renderer="original-static"] img'),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Celebrate", exact: true }),
  ).toBeDisabled();
});

test("reduced motion retains unchanged original artwork", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Say hello to Tiggy" }),
  ).toHaveAttribute("data-character-renderer", "original-static");
});
