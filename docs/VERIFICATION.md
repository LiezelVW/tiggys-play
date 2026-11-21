# Verification evidence

## Final code verification

The functional code at commit `6a5c667` passed [clean GitHub CI](https://github.com/LiezelVW/tiggys-play/actions/runs/44937581672): **31 browser tests passed; one intentional desktop-only touch-test skip**. The matrix covers desktop Chromium, tablet Chromium, phone Chromium and phone WebKit.

The run includes `npm ci`, browser installation, `npm run build`, the asset/private-photo guard and `npm test`. TypeScript also passed locally. All eight Safari/WebKit checks passed locally after the portrait initialization fix, including complete Colour Garden and Monster Truck Mayhem flows, retry recovery, touch input, replay, progress, parent controls, session limits and reduced motion.

The portrait fix establishes the host's aspect ratio in CSS before Phaser boots and observes subsequent size changes. It fixes an initial resize race that could shift targets between early touches. The games use the lightweight Phaser Canvas renderer.

Earlier local attempts encountered a machine-wide disk/swap exhaustion and were superseded by the clean CI run. No unresolved runtime or missing-asset failure remains in the verified browser matrix. This evidence does not replace physical-device acceptance on iPhone, Android and iPad, or final art/audio review.

## Actual rendered screenshots

| World | Trucks | Garden |
| --- | --- | --- |
| [Desktop](screenshots/world-desktop.png) | [Desktop](screenshots/trucks-desktop.png) | [Desktop](screenshots/garden-desktop.png) |
| [Tablet](screenshots/world-tablet.png) | [Tablet](screenshots/trucks-tablet.png) | [Tablet](screenshots/garden-tablet.png) |
| [Phone](screenshots/world-mobile.png) | [Phone](screenshots/trucks-mobile.png) | [Phone](screenshots/garden-mobile.png) |

Driving captures are also included for all three sizes. These are actual browser screenshots, not mockups. No photograph is present in any capture.

## Review status

The implementation is on `fix/illustrated-playable-world`, targeting `main` through PR #2. It has not been merged. The new character atlas follows the supplied approved design; final animation cleanup and licensed voice-performance review remain production follow-up, as documented in the asset manifest and roadmap.
