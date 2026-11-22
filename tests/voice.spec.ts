import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { voicePrompts } from "../src/game/voicePrompts";
import { activate } from "./input";
async function parent(page: import("@playwright/test").Page) {
  await activate(page.getByRole("button", { name: "Grown-ups" }));
  await page.getByLabel("Your answer").fill("42");
  await activate(page.getByRole("button", { name: "Open parent area" }));
  await activate(
    page.getByRole("button", { name: "Record Tiggy’s voice", exact: true }),
  );
}
test("parent records or imports, previews, persists, exports and restores a voice", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const win = window as unknown as {
      micRequests: number;
      streams: MediaStream[];
      played: string[];
      successfulPlaybacks: number;
    };
    win.micRequests = 0;
    win.streams = [];
    win.played = [];
    win.successfulPlaybacks = 0;
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      win.played.push(this.src);
      return play.call(this).then(() => {
        win.successfulPlaybacks++;
      });
    };
    const devices = navigator.mediaDevices;
    Object.defineProperty(Object.getPrototypeOf(devices), "getUserMedia", {
      configurable: true,
      writable: true,
      value: async () => {
        win.micRequests++;
        const ctx = new AudioContext(),
          osc = ctx.createOscillator(),
          dest = ctx.createMediaStreamDestination();
        osc.frequency.value = 220;
        osc.connect(dest);
        osc.start();
        void ctx.resume();
        dest.stream.getTracks().forEach((t) =>
          t.addEventListener("ended", () => {
            osc.stop();
            void ctx.close();
          }),
        );
        win.streams.push(dest.stream);
        return dest.stream;
      },
    });
  });
  await page.goto("/");
  await parent(page);
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { micRequests: number }).micRequests,
      ),
    )
    .toBe(0);
  expect(
    await page.evaluate(() =>
      navigator.mediaDevices.getUserMedia.toString().includes("micRequests"),
    ),
  ).toBe(true);
  await page.context().grantPermissions(["microphone"]);
  await activate(
    page.getByRole("button", { name: "Record this line", exact: true }),
  );
  const canRecord = await page.evaluate(
    () => typeof MediaRecorder !== "undefined",
  );
  if (canRecord) {
    await expect(
      page.getByRole("button", { name: /Stop recording/ }),
    ).toBeVisible();
    await page.waitForTimeout(700);
    await activate(page.getByRole("button", { name: /Stop recording/ }));
  } else {
    // Linux WebKit can lack MediaRecorder entirely. Verify the real import fallback.
    await expect(page.getByRole("status")).toContainText(
      "import an audio recording",
    );
    const samples = 5600,
      wav = Buffer.alloc(44 + samples * 2);
    wav.write("RIFF", 0);
    wav.writeUInt32LE(wav.length - 8, 4);
    wav.write("WAVEfmt ", 8);
    wav.writeUInt32LE(16, 16);
    wav.writeUInt16LE(1, 20);
    wav.writeUInt16LE(1, 22);
    wav.writeUInt32LE(8000, 24);
    wav.writeUInt32LE(16000, 28);
    wav.writeUInt16LE(2, 32);
    wav.writeUInt16LE(16, 34);
    wav.write("data", 36);
    wav.writeUInt32LE(samples * 2, 40);
    for (let i = 0; i < samples; i++)
      wav.writeInt16LE(
        Math.round(Math.sin((i * 2 * Math.PI * 220) / 8000) * 2000),
        44 + i * 2,
      );
    await page.getByLabel("Or import an audio recording").setInputFiles({
      name: "test-tone.wav",
      mimeType: "audio/wav",
      buffer: wav,
    });
  }
  await expect(
    page.getByRole("button", { name: "Use this recording" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      (window as unknown as { streams: MediaStream[] }).streams.every((s) =>
        s.getTracks().every((t) => t.readyState === "ended"),
      ),
    ),
  ).toBeTruthy();
  const format = await page.locator("audio").evaluate(async (e) => {
    const blob = await fetch((e as HTMLAudioElement).src).then((r) => r.blob());
    return { type: blob.type, size: blob.size };
  });
  expect(format.type).toMatch(/^audio\//);
  expect(format.size).toBeGreaterThan(0);
  expect(
    await page.evaluate(
      () => (window as unknown as { micRequests: number }).micRequests,
    ),
  ).toBe(canRecord ? 1 : 0);
  await activate(page.getByRole("button", { name: "Use this recording" }));
  await expect(
    page.getByText(`1 of ${voicePrompts.length} lines saved`),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Grown-ups" })).toBeEnabled();
  await activate(page.getByRole("button", { name: "Say hello to Tiggy" }));
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as { played: string[] }).played.some((u) =>
          u.startsWith("blob:"),
        ),
      ),
    )
    .toBeTruthy();
  expect(
    await page.evaluate(() =>
      "speechSynthesis" in window ? speechSynthesis.speaking : false,
    ),
  ).toBe(false);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { successfulPlaybacks: number })
            .successfulPlaybacks,
      ),
    )
    .toBeGreaterThan(0);
  await parent(page);
  const downloadPromise = page.waitForEvent("download");
  await activate(page.getByRole("button", { name: "Export voice pack" }));
  const downloaded = await downloadPromise;
  const pack = await readFile((await downloaded.path())!);
  expect(JSON.parse(pack.toString()).clips[0].id).toBe("tiggy-hello");
  await activate(
    page.getByRole("button", { name: "Delete all voice recordings" }),
  );
  await expect(
    page.getByText(`0 of ${voicePrompts.length} lines saved`),
  ).toBeVisible();
  await page.getByLabel("Restore an exported voice pack").setInputFiles({
    name: "voice-pack.json",
    mimeType: "application/json",
    buffer: pack,
  });
  await expect(
    page.getByText(`1 of ${voicePrompts.length} lines saved`),
  ).toBeVisible();
});
test("closing the parent recorder releases the microphone", async ({
  page,
}) => {
  test.skip(
    test.info().project.name !== "desktop",
    "Lifecycle covered once in addition to the full recording matrix",
  );
  await page.addInitScript(() => {
    const win = window as unknown as { recordingStream: MediaStream };
    Object.defineProperty(
      Object.getPrototypeOf(navigator.mediaDevices),
      "getUserMedia",
      {
        value: async () => {
          const ctx = new AudioContext(),
            dest = ctx.createMediaStreamDestination(),
            o = ctx.createOscillator();
          o.connect(dest);
          o.start();
          void ctx.resume();
          win.recordingStream = dest.stream;
          dest.stream.getTracks()[0].addEventListener("ended", () => {
            o.stop();
            void ctx.close();
          });
          return dest.stream;
        },
      },
    );
  });
  await page.goto("/");
  await parent(page);
  await activate(
    page.getByRole("button", { name: "Record this line", exact: true }),
  );
  await expect(
    page.getByRole("button", { name: /Stop recording/ }),
  ).toBeVisible();
  await activate(page.getByRole("button", { name: "Close grown-ups" }));
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as unknown as { recordingStream: MediaStream }
          ).recordingStream.getAudioTracks()[0].readyState,
      ),
    )
    .toBe("ended");
});
