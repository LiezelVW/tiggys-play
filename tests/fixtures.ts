import { test as base } from "@playwright/test";
export * from "@playwright/test";
// Gameplay tests begin after the first-visit welcome. Dedicated loading tests cover that flow separately.
export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    if (!testInfo.title.startsWith("loading screen:"))
      await page.addInitScript(() => {
        try {
          sessionStorage.setItem("tiggy-entered-session", "1");
        } catch {}
      });
    await use(page);
  },
});
