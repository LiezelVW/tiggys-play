import { test, expect } from "./fixtures";
import { activities, activityIds } from "../src/game/activities";
import { approvedVoiceUrl } from "../src/game/approvedVoice";
import { activate } from "./input";
for (const id of activityIds) {
  test(`${id}: complete the activity, replay and persist progress`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await activate(
      page.getByRole("button", {
        name: `Open ${activities[id].name}`,
        exact: true,
      }),
    );
    const main = page.getByRole("main", {
      name: activities[id].name,
      exact: true,
    });
    await expect(main.locator('.game-canvas[data-ready="true"]')).toBeVisible();
    if (
      activities[id].character === "tiggy" &&
      approvedVoiceUrl(activities[id].steps[0].clip)
    ) {
      await expect(
        page.getByRole("button", { name: "Hear instructions again" }),
      ).toBeEnabled();
    } else {
      await expect(
        page.getByRole("button", { name: "Dialogue shown in speech bubble" }),
      ).toBeDisabled();
    }
    await activate(page.getByText("Use keyboard or simple matching controls"));
    const first = activities[id].steps[0];
    const incorrect = first.choices.find((c) => !first.correct.includes(c.id));
    if (incorrect && id !== "ferris") {
      await activate(
        page.getByRole("button", {
          name: `Choose ${incorrect.label.toLowerCase()}`,
          exact: true,
        }),
      );
      await expect(main).toHaveAttribute("data-step", "0");
      await expect(main.locator(".speech-bubble")).toContainText(
        "Let’s try again!",
      );
    }
    for (let i = 0; i < activities[id].steps.length; i++) {
      await expect(main).toHaveAttribute("data-step", String(i));
      const step = activities[id].steps[i];
      for (const key of step.correct) {
        const choice = step.choices.find((c) => c.id === key)!;
        await activate(
          page.getByRole("button", {
            name: `Choose ${choice.label.toLowerCase()}`,
            exact: true,
          }),
        );
      }
      if (id === "breakfast" && i === 2)
        await activate(
          page.getByRole("button", { name: "Continue playing", exact: true }),
        );
    }
    await expect(page.getByRole("dialog")).toContainText("You did it!");
    expect(
      await page.evaluate(
        (id) =>
          JSON.parse(localStorage.getItem("tiggy-progress")!).activities[id],
        id,
      ),
    ).toBe(1);
    await activate(
      page.getByRole("button", { name: "Play again", exact: true }),
    );
    await expect(main).toHaveAttribute("data-step", "0");
    await expect(main.locator('.game-canvas[data-ready="true"]')).toBeVisible();
    await activate(page.getByRole("button", { name: "My world", exact: true }));
    await page.reload();
    expect(
      await page.evaluate(
        (id) =>
          JSON.parse(localStorage.getItem("tiggy-progress")!).activities[id],
        id,
      ),
    ).toBe(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}
test("routine can be left without completion, and parent gate pauses the activity", async ({
  page,
}) => {
  await page.goto("/");
  await activate(
    page.getByRole("button", { name: "Open Potty Time", exact: true }),
  );
  await expect(page.locator('.game-canvas[data-ready="true"]')).toBeVisible();
  await activate(page.getByRole("button", { name: "All done for now" }));
  await expect(
    page.getByRole("main", { name: "Tiggy’s adventure playground" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("tiggy-progress")),
  ).toBeNull();
  await activate(
    page.getByRole("button", { name: "Open Ferris Wheel", exact: true }),
  );
  await expect(page.locator('.game-canvas[data-ready="true"]')).toBeVisible();
  await activate(page.getByText("Use keyboard or simple matching controls"));
  await activate(page.getByRole("button", { name: "Grown-ups" }));
  await expect(
    page.getByRole("button", { name: "Choose red cabin" }),
  ).toBeDisabled();
  await activate(page.getByRole("button", { name: "Close grown-ups" }));
  await expect(
    page.getByRole("button", { name: "Choose red cabin" }),
  ).toBeEnabled();
});
