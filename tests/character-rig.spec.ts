import { test, expect } from "./fixtures";
import { activate } from "./input";
async function pixels(canvas: import("@playwright/test").Locator) {
  return canvas.evaluate((e) => {
    const c = e as HTMLCanvasElement,
      d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    let h = 2166136261;
    for (let i = 0; i < d.length; i += 4)
      h = Math.imul(h ^ d[i] ^ d[i + 1] ^ d[i + 2] ^ d[i + 3], 16777619);
    return h >>> 0;
  });
}
test("all original-vector character actions visibly animate without a Rive file", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.goto("/");
  const character = page.getByRole("button", { name: "Say hello to Tiggy" }),
    canvas = character.locator("canvas");
  await expect(character).toHaveAttribute(
    "data-character-renderer",
    "layered-vector",
  );
  await character.scrollIntoViewIfNeeded();
  await character.focus();
  for (const [key, name] of [
    ["Escape", "Idle"],
    ["w", "Wave"],
    ["ArrowRight", "Walk"],
    ["t", "Talk"],
    ["c", "Clap"],
    ["j", "Celebrate"],
    ["q", "Thinking"],
    ["h", "Help"],
    ["l", "Happy"],
  ]) {
    await page.keyboard.down(key);
    await expect(canvas).toHaveAttribute("data-action", name);
    await page.waitForTimeout(130);
    const a = await pixels(canvas);
    await page.waitForTimeout(260);
    const b = await pixels(canvas);
    expect(b, `${name} changes rendered pixels`).not.toBe(a);
    await page.keyboard.up(key);
  }
  expect(
    requests.some(
      (u) => u.includes("tiggy-actions") || /\.riv(?:\?|$)|rive\.wasm/.test(u),
    ),
  ).toBe(false);
  await activate(
    page.getByRole("button", { name: "Play Colour Garden", exact: true }),
  );
  await expect(page.locator('.game-canvas[data-ready="true"]')).toBeVisible();
  await expect(page.locator(".game-canvas canvas")).toHaveAttribute(
    "data-tiggy-frame",
    /\d+/,
  );
});
test("retired character test page returns to the playable world", async ({
  page,
}) => {
  await page.goto("/character-lab");
  await expect(
    page.getByRole("main", { name: "Tiggy’s adventure playground" }),
  ).toBeVisible();
  await expect(page.getByText("Character rig review")).toHaveCount(0);
});
test("reduced motion keeps the original character still while games remain playable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const canvas = page.locator(".tiggy-character canvas");
  await page.waitForTimeout(150);
  const a = await pixels(canvas);
  await page.waitForTimeout(300);
  expect(await pixels(canvas)).toBe(a);
  await activate(
    page.getByRole("button", { name: "Play Colour Garden", exact: true }),
  );
  await expect(page.locator('.game-canvas[data-ready="true"]')).toBeVisible();
});
