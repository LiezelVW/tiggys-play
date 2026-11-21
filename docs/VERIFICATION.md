# Verification evidence

The production build and asset/private-photo guard pass locally. Rendered screenshots of the world, truck selection, driving and Colour Garden are in `docs/screenshots` at desktop, tablet and phone widths.

Local Chromium checks cover complete game loops, replay, retries, local persistence and parental controls. The latest portrait Colour Garden passes completion, retry, touch, replay and parent tests on Chromium.

Safari/WebKit verification is in progress. Five checks passed locally; remaining checks encountered a retry-input assertion and a machine-wide `ENOSPC` failure during artifact capture. The machine's swap and disk were exhausted. The PR remains draft until clean browser evidence is collected. Browser emulation does not establish physical iPhone/Android/iPad acceptance.

## Rendered captures

| World                                    | Trucks                                    | Garden                                    |
| ---------------------------------------- | ----------------------------------------- | ----------------------------------------- |
| [Desktop](screenshots/world-desktop.png) | [Desktop](screenshots/trucks-desktop.png) | [Desktop](screenshots/garden-desktop.png) |
| [Tablet](screenshots/world-tablet.png)   | [Tablet](screenshots/trucks-tablet.png)   | [Tablet](screenshots/garden-tablet.png)   |
| [Phone](screenshots/world-mobile.png)    | [Phone](screenshots/trucks-mobile.png)    | [Phone](screenshots/garden-mobile.png)    |

Driving captures are also included for all three sizes. These are actual browser screenshots, not mockups. No photograph is present in any capture.
