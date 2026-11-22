import { test, expect } from "@playwright/test";
import { voicePrompts, requiredVoiceIds } from "../src/game/voicePrompts";
import { activate } from "./input";
function tone() {
  const n = 2400,
    w = Buffer.alloc(44 + n * 2);
  w.write("RIFF", 0);
  w.writeUInt32LE(w.length - 8, 4);
  w.write("WAVEfmt ", 8);
  w.writeUInt32LE(16, 16);
  w.writeUInt16LE(1, 20);
  w.writeUInt16LE(1, 22);
  w.writeUInt32LE(8000, 24);
  w.writeUInt32LE(16000, 28);
  w.writeUInt16LE(2, 32);
  w.writeUInt16LE(16, 34);
  w.write("data", 36);
  w.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++)
    w.writeInt16LE(
      Math.round(Math.sin((i * Math.PI * 440) / 8000) * 1200),
      44 + i * 2,
    );
  return w;
}
async function studio(page: import("@playwright/test").Page) {
  await activate(page.getByRole("button", { name: "Grown-ups" }));
  await page.getByLabel("Your answer").fill("42");
  await activate(page.getByRole("button", { name: "Open parent area" }));
  await activate(
    page.getByRole("button", { name: "Voice preview & approval" }),
  );
}
test("audition is separate from approval, complete packs persist, character voices never mix", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const win = window as unknown as {
      plays: { src: string; rate: number; volume: number }[];
    };
    win.plays = [];
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      win.plays.push({
        src: this.src,
        rate: this.playbackRate,
        volume: this.volume,
      });
      return original.call(this);
    };
  });
  await page.goto("/");
  await studio(page);
  await expect(
    page.getByText("No childlike generated candidate is bundled yet.", {
      exact: false,
    }),
  ).toBeVisible();
  await page
    .getByLabel("Candidate name", { exact: true })
    .fill("Test tone candidate (not speech)");
  await page
    .getByLabel("Add MP3 or WAV dialogue", { exact: true })
    .setInputFiles({
      name: "well-done.wav",
      mimeType: "audio/wav",
      buffer: tone(),
    });
  await expect(page.getByRole("status")).toContainText("audition only");
  await expect(
    page.getByRole("button", { name: "Approve this voice for games" }),
  ).toBeDisabled();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("tiggy-approved-voice-tiggy"),
    ),
  ).toBeNull();
  await page
    .getByLabel("Preview phrase", { exact: true })
    .selectOption("well-done");
  await activate(
    page.getByRole("button", { name: "Play candidate", exact: true }),
  );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { plays: { src: string }[] }).plays.filter(
            (p) => p.src.startsWith("blob:"),
          ).length,
      ),
    )
    .toBeGreaterThan(0);
  expect(
    await page.evaluate(() =>
      localStorage.getItem("tiggy-approved-voice-tiggy"),
    ),
  ).toBeNull();
  const pack = {
    format: "tiggys-character-candidate",
    version: 1,
    name: "Complete test tone pack",
    character: "tiggy",
    provider: "Test fixture, not a voice",
    voiceId: "test-tone",
    clips: voicePrompts.map(([id]) => ({
      id,
      audio: `data:audio/wav;base64,${tone().toString("base64")}`,
    })),
  };
  await page
    .getByLabel("Or import a character candidate pack", { exact: true })
    .setInputFiles({
      name: "candidate.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(pack)),
    });
  await expect(
    page.getByLabel("Candidate to audition", { exact: true }),
  ).toContainText("Complete test tone pack");
  await activate(page.getByRole("checkbox"));
  await activate(
    page.getByRole("button", { name: "Approve this voice for games" }),
  );
  await expect(page.getByRole("status")).toContainText(
    "Approved on this device",
  );
  const approved = await page.evaluate(() =>
    localStorage.getItem("tiggy-approved-voice-tiggy"),
  );
  expect(approved).toBeTruthy();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("tiggy-approved-voice-benny"),
    ),
  ).toBeNull();
  await page.getByLabel("Sound volume", { exact: true }).evaluate((e) => {
    const input = e as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!;
    setter.call(input, "35");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.reload();
  await activate(
    page.getByRole("button", { name: "Say hello to Tiggy", exact: true }),
  );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { plays: { src: string }[] }).plays.filter(
            (p) => p.src.startsWith("blob:"),
          ).length,
      ),
    )
    .toBeGreaterThan(0);
  expect(await page.evaluate(() => localStorage.getItem("tiggy-volume"))).toBe(
    "0.35",
  );
  const playedVolume = await page.evaluate(
    () =>
      (window as unknown as { plays: { src: string; volume: number }[] }).plays
        .filter((p) => p.src.startsWith("blob:"))
        .at(-1)?.volume,
  );
  expect(playedVolume).toBeCloseTo(0.35, 2);
  const rates = await page.evaluate(() =>
    (window as unknown as { plays: { rate: number; src: string }[] }).plays
      .filter((p) => p.src.startsWith("blob:"))
      .map((p) => p.rate),
  );
  expect(rates.every((r) => r === 1)).toBe(true);
  await studio(page);
  await page.getByLabel("Character", { exact: true }).selectOption("benny");
  await expect(
    page.getByText("Speech bubbles only", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Character", { exact: true }).selectOption("tiggy");
  await activate(
    page.getByRole("button", { name: "Restore previous voice", exact: true }),
  );
  expect(
    await page.evaluate(() =>
      localStorage.getItem("tiggy-approved-voice-tiggy"),
    ),
  ).toBeNull();
  expect(requiredVoiceIds("benny").length).toBeLessThan(voicePrompts.length);
});
test("invalid dialogue filenames cannot create candidates", async ({
  page,
}) => {
  await page.goto("/");
  await studio(page);
  await page.getByLabel("Candidate name", { exact: true }).fill("Bad import");
  await page
    .getByLabel("Add MP3 or WAV dialogue", { exact: true })
    .setInputFiles({
      name: "unknown.wav",
      mimeType: "audio/wav",
      buffer: tone(),
    });
  await expect(page.getByRole("status")).toContainText("phrase ID");
  await expect(
    page.getByLabel("Candidate to audition", { exact: true }).locator("option"),
  ).toHaveCount(1);
});
