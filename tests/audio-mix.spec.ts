import { test, expect } from "./fixtures";
import { activate } from "./input";
test("original music ducks during approved speech; independent audio levels persist", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const win = window as unknown as { gains: number[] };
    win.gains = [];
    const sourceFactory = AudioContext.prototype.createMediaElementSource;
    AudioContext.prototype.createMediaElementSource = function (element) {
      const source = sourceFactory.call(this, element),
        meter = this.createAnalyser();
      source.connect(meter);
      (window as unknown as { voiceMeter: AnalyserNode }).voiceMeter = meter;
      const started = performance.now();
      const collect = () => {
        const samples = new Uint8Array(meter.fftSize);
        meter.getByteTimeDomainData(samples);
        const peak = samples.reduce(
          (max, value) => Math.max(max, Math.abs(value - 128)),
          0,
        );
        const win = window as unknown as { voicePeak?: number };
        win.voicePeak = Math.max(win.voicePeak || 0, peak);
        if (performance.now() - started < 8000) requestAnimationFrame(collect);
      };
      requestAnimationFrame(collect);
      return source;
    };
    const original = AudioParam.prototype.setTargetAtTime;
    AudioParam.prototype.setTargetAtTime = function (value, start, constant) {
      win.gains.push(value);
      return original.call(this, value, start, constant);
    };
  });
  await page.goto("/");
  await activate(page.getByRole("button", { name: "Say hello to Tiggy" }));
  await expect(page.locator(".tiggy-character canvas")).toHaveAttribute(
    "data-speaking",
    "true",
  );
  await expect(page.locator(".tiggy-character canvas")).toHaveAttribute(
    "data-action",
    "Wave",
  );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          ((window as unknown as { voicePeak?: number }).voicePeak || 0) > 2,
      ),
    )
    .toBe(true);
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as { gains: number[] }).gains.some(
          (v) => Math.abs(v - 0.045) < 0.001,
        ),
      ),
    )
    .toBe(true);
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as { gains: number[] }).gains.at(-2),
      ),
    )
    .toBeCloseTo(0.18, 2);
  await activate(page.getByRole("button", { name: "Grown-ups" }));
  await page.getByLabel("Your answer").fill("42");
  await activate(page.getByRole("button", { name: "Open parent area" }));
  for (const [label, value] of [
    ["Sound volume", "30"],
    ["Music volume", "12"],
    ["Effects volume", "25"],
  ]) {
    await page.getByLabel(label, { exact: true }).evaluate((e, value) => {
      const input = e as HTMLInputElement;
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }, value);
  }
  expect(
    await page.evaluate(() => [
      localStorage.getItem("tiggy-volume"),
      localStorage.getItem("tiggy-music-volume"),
      localStorage.getItem("tiggy-effects-volume"),
    ]),
  ).toEqual(["0.3", "0.12", "0.25"]);
  await page.reload();
  await activate(page.getByRole("button", { name: "Grown-ups" }));
  await page.getByLabel("Your answer").fill("42");
  await activate(page.getByRole("button", { name: "Open parent area" }));
  for (const [label, value] of [
    ["Sound volume", "30"],
    ["Music volume", "12"],
    ["Effects volume", "25"],
  ])
    await expect(page.getByLabel(label, { exact: true })).toHaveValue(value);
});
