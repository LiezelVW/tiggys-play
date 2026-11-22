import { activate } from "./input";
import { test, expect } from "@playwright/test";
test("trucks: wrong colour retry, three ramp runs, replay and persistent progress", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await activate(
    page
      .getByRole("button", { name: "Play Monster Truck Mayhem", exact: true })
      .first(),
  );
  await expect(page.locator(".game-canvas")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await activate(page.getByRole("button", { name: "Choose blue truck" }));
  await expect(
    page.getByText("Let’s find the red truck. Try another one!"),
  ).toBeVisible();
  for (const colour of ["red", "blue", "yellow"]) {
    await activate(
      page.getByRole("button", { name: `Choose ${colour} truck` }),
    );
    for (let i = 0; i < 4; i++) {
      await activate(page.getByRole("button", { name: "GO!", exact: true }));
      if (i < 3) await page.waitForTimeout(1100);
    }
    if (colour !== "yellow")
      await expect(
        page.getByRole("button", {
          name: `Choose ${colour === "red" ? "blue" : "yellow"} truck`,
        }),
      ).toBeVisible();
  }
  await expect(
    page.getByRole("heading", { name: "What a colourful adventure!" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("tiggy-progress") || "{}").trucks,
      ),
    )
    .toBe(1);
  await activate(page.getByRole("button", { name: "Play again", exact: true }));
  await expect(
    page.getByRole("button", { name: "Choose red truck" }),
  ).toBeVisible();
  await activate(page.getByRole("button", { name: "My world", exact: true }));
  await expect(
    page.getByRole("main", { name: "Tiggy’s adventure playground" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("world art and available activities load, sound persists and no document overflow", async ({
  page,
}) => {
  const missing: string[] = [];
  page.on("response", (r) => {
    if (r.status() >= 400 && r.url().includes("/assets/"))
      missing.push(r.url());
  });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Grown-ups" })).toBeEnabled();
  await expect
    .poll(() =>
      page
        .locator(".world-background")
        .evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
    )
    .toBeTruthy();
  await expect(page.locator(".tiggy-character")).toBeVisible();
  for (const name of [
    "Little Builders",
    "Tiggy’s Railway",
    "Science Lab",
    "Build & Solve",
    "Ready, Set, Go!",
  ]) {
    await expect(
      page.getByRole("button", { name: `Play ${name}`, exact: true }),
    ).toBeAttached();
    // Signposts must remain reachable over the scaled art and character hitboxes.
    if (test.info().project.use.hasTouch)
      await page
        .getByRole("button", { name: `Play ${name}`, exact: true })
        .tap({ trial: true });
    else
      await page
        .getByRole("button", { name: `Play ${name}`, exact: true })
        .click({ trial: true });
    await expect(
      page.getByLabel(`${name}, coming soon`, { exact: true }),
    ).toHaveCount(0);
  }
  await activate(page.getByRole("button", { name: "Mute sound" }));
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Turn sound on" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  expect(missing).toEqual([]);
});
test("session limit gates both the world and game", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("tiggy-limit", "10"));
  await page.clock.install();
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Grown-ups" })).toBeEnabled();
  await page.clock.fastForward(601000);
  await expect(
    page.getByRole("heading", { name: "Time for a little break." }),
  ).toBeVisible();
  await activate(page.getByRole("button", { name: "Find a grown-up" }));
  await page.getByLabel("Your answer").fill("42");
  await activate(page.getByRole("button", { name: "Open parent area" }));
  await activate(
    page.getByRole("button", { name: "Start a new play session" }),
  );
  await expect(
    page.getByRole("heading", { name: "Time for a little break." }),
  ).toHaveCount(0);
});

test("reduced motion keeps play available and disables ambient animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".world-truck")).toHaveCSS(
    "animation-name",
    "none",
  );
  await activate(
    page.getByRole("button", {
      name: "Play Monster Truck Mayhem",
      exact: true,
    }),
  );
  await expect(page.locator(".game-canvas")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await activate(page.getByRole("button", { name: "Choose red truck" }));
  await activate(page.getByRole("button", { name: "GO!", exact: true }));
  await expect(
    page.getByRole("progressbar", { name: "Distance to finish" }),
  ).toHaveAttribute("value", "0.25");
});

test("quick repeated drive taps are queued through the ramp", async ({
  page,
}) => {
  await page.goto("/");
  await activate(
    page.getByRole("button", {
      name: "Play Monster Truck Mayhem",
      exact: true,
    }),
  );
  await expect(page.locator(".game-canvas")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await activate(page.getByRole("button", { name: "Choose red truck" }));
  for (let i = 0; i < 4; i++)
    await activate(page.getByRole("button", { name: "GO!", exact: true }));
  await expect(
    page.getByRole("button", { name: "Choose blue truck" }),
  ).toBeVisible({ timeout: 10000 });
});
