import { test, type Locator } from "@playwright/test";
/** Exercise touch on emulated phones/tablets, and mouse on desktop. */
export function activate(locator: Locator) {
  return test.info().project.use.hasTouch ? locator.tap() : locator.click();
}
