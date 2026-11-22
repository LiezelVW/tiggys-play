import { test, expect, type Page } from "./fixtures";
import { activate } from "./input";
async function drag(page: Page, from: [number, number], to: [number, number]) {
  const canvas = page.locator(".game-canvas canvas");
  await canvas.scrollIntoViewIfNeeded();
  const b = (await canvas.boundingBox())!,
    w = await canvas.getAttribute("width"),
    h = await canvas.getAttribute("height");
  const a = {
      x: b.x + (from[0] / Number(w)) * b.width,
      y: b.y + (from[1] / Number(h)) * b.height,
    },
    z = {
      x: b.x + (to[0] / Number(w)) * b.width,
      y: b.y + (to[1] / Number(h)) * b.height,
    };
  if (test.info().project.use.hasTouch) {
    // Touch events reach Phaser's real TouchManager, including movement, rather than its keyboard fallback.
    await canvas.evaluate(
      (element, { a, z }) => {
        const touch = (type: string, x: number, y: number) => {
          const point = {
            identifier: 9,
            target: element,
            clientX: x,
            clientY: y,
            pageX: x + scrollX,
            pageY: y + scrollY,
            screenX: x,
            screenY: y,
            radiusX: 8,
            radiusY: 8,
            force: 1,
          };
          const event = new Event(type, { bubbles: true, cancelable: true });
          Object.defineProperties(event, {
            touches: { value: type === "touchend" ? [] : [point] },
            targetTouches: { value: type === "touchend" ? [] : [point] },
            changedTouches: { value: [point] },
          });
          element.dispatchEvent(event);
        };
        touch("touchstart", a.x, a.y);
        for (let i = 1; i <= 16; i++)
          touch(
            "touchmove",
            a.x + ((z.x - a.x) * i) / 16,
            a.y + ((z.y - a.y) * i) / 16,
          );
        touch("touchend", z.x, z.y);
      },
      { a, z },
    );
  } else {
    await page.mouse.move(a.x, a.y);
    await page.mouse.down();
    await page.mouse.move(z.x, z.y, { steps: 16 });
    await page.mouse.up();
  }
}
async function open(page: Page, name: string) {
  await page.goto("/");
  await activate(
    page.getByRole("button", { name: `Open ${name}`, exact: true }),
  );
  await expect(page.locator('.game-canvas[data-ready="true"]')).toBeVisible();
  return (await page.locator(".game-canvas canvas").getAttribute("width")) ===
    "600"
    ? 600
    : 1000;
}
test("Ferris wheel: drag passengers into matching cabins and complete all three rides", async ({
  page,
}) => {
  const w = await open(page, "Ferris Wheel"),
    main = page.getByRole("main", { name: "Ferris Wheel", exact: true });
  await drag(page, [w / 2 - 150, 455], [w / 2 - 125, 238]);
  await expect(main).toHaveAttribute("data-step", "0"); // wrong cabin returns the passenger, no penalty
  for (let step = 0; step < 3; step++) {
    await expect(main).toHaveAttribute("data-step", String(step));
    const a = (step * Math.PI) / 3 + (step * Math.PI) / 3;
    await drag(
      page,
      [w / 2 + (step - 1) * 150, 455],
      [w / 2 + Math.cos(a) * 125, 238 + Math.sin(a) * 125],
    );
    if (step === 0)
      await expect(page.locator(".game-canvas canvas")).toHaveAttribute(
        "data-tiggy-action",
        "Clap",
      );
  }
  await expect(page.getByRole("dialog")).toContainText("You did it!");
});
test("Railway: drag correct cars to the coupling slots and the finished train departs", async ({
  page,
}) => {
  const w = await open(page, "Tiggy’s Railway"),
    main = page.getByRole("main", { name: "Tiggy’s Railway", exact: true });
  for (let i = 0; i < 3; i++) {
    await expect(main).toHaveAttribute("data-step", String(i));
    await drag(page, [w / 2 + (i === 2 ? 150 : 0), 455], [115 + i * 140, 265]);
  }
  await expect(page.getByRole("dialog")).toContainText("You did it!");
});
test("Breakfast: scoop, drag the loaded spoon from the bowl, pause voluntarily, wipe and offer water", async ({
  page,
}) => {
  const w = await open(page, "Benny Bear’s Breakfast"),
    main = page.getByRole("main", {
      name: "Benny Bear’s Breakfast",
      exact: true,
    });
  await drag(page, [w / 2 - 150, 455], [w / 2 - 140, 300]);
  await expect(main).toHaveAttribute("data-step", "1");
  await drag(page, [w / 2 - 150, 455], [w / 2 - 140, 300]);
  await expect(main).toHaveAttribute("data-step", "2");
  await drag(page, [w / 2 - 140, 310], [w / 2, 225]);
  await expect(
    page.getByText(
      "Now your turn! Pretending is welcome. There is no need to eat.",
    ),
  ).toBeVisible();
  await expect(main).toHaveAttribute("data-step", "2");
  await activate(
    page.getByRole("button", { name: "Continue playing", exact: true }),
  );
  await expect(main).toHaveAttribute("data-step", "3");
  await drag(page, [w / 2 - 150, 455], [w / 2, 225]);
  await expect(main).toHaveAttribute("data-step", "4");
  await drag(page, [w / 2, 455], [w / 2, 225]);
  await expect(main).toHaveAttribute("data-step", "5");
  await drag(page, [w / 2 - 150, 455], [w / 2 - 140, 300]);
  await expect(page.getByRole("dialog")).toContainText("You did it!");
});
