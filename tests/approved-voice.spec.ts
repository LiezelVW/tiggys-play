import { test, expect } from "@playwright/test";
import { approvedVoice } from "../src/game/approvedVoice";
import { activate } from "./input";

test("approved cartoon voice plays on a fresh device; every shipped clip decodes", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLMediaElement.prototype.play;
    const win = window as unknown as { approvedPlays: string[] };
    win.approvedPlays = [];
    HTMLMediaElement.prototype.play = function () {
      return original.call(this).then(() => {
        if (this.src.includes("tiggy-approved-v1"))
          win.approvedPlays.push(this.src);
      });
    };
  });
  await page.goto("/");
  await activate(page.getByRole("button", { name: "Say hello to Tiggy" }));
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { approvedPlays: string[] }).approvedPlays,
      ),
    )
    .toContainEqual(expect.stringContaining("lets-play.wav"));
  // Real media decoding of all packaged cuts in each browser engine; no synthesis fixture.
  const clips = await page.evaluate(async (paths) => {
    return Promise.all(
      paths.map(
        (src) =>
          new Promise<{ src: string; duration: number; error?: string }>(
            (resolve) => {
              const audio = new Audio();
              const timer = setTimeout(
                () => resolve({ src, duration: 0, error: "timeout" }),
                10000,
              );
              audio.onloadedmetadata = () => {
                clearTimeout(timer);
                resolve({ src, duration: audio.duration });
                audio.removeAttribute("src");
                audio.load();
              };
              audio.onerror = () => {
                clearTimeout(timer);
                resolve({ src, duration: 0, error: "decode" });
              };
              audio.src = src;
              audio.preload = "metadata";
            },
          ),
      ),
    );
  }, Object.values(approvedVoice));
  expect(clips).toHaveLength(15);
  for (const clip of clips) {
    expect(clip.error, clip.src).toBeUndefined();
    expect(clip.duration).toBeGreaterThan(0.3);
  }
  await activate(
    page.getByRole("button", { name: "Play Colour Garden", exact: true }),
  );
  await expect(page.locator('.game-canvas[data-ready="true"]')).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Spoken instructions awaiting voice approval",
    }),
  ).toBeDisabled();
  await activate(page.getByText("Use keyboard or simple matching controls"));
  await activate(page.getByRole("button", { name: "Match red", exact: true }));
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { approvedPlays: string[] }).approvedPlays
            .length,
      ),
    )
    .toBeGreaterThan(1);
  await expect(page.locator(".instruction")).toContainText(
    /Well done!|You did it!|Yay!/,
  );
});
