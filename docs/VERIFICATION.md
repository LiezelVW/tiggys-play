# Verification evidence

## Follow-up: logo, ramp contact and recording

Functional commit `67f9ef5`: the production build, TypeScript check and asset/private-photo guard pass. The browser matrix covers desktop Chromium (1440 × 1000), tablet Chromium (1024 × 1366), phone Chromium and phone WebKit. See the latest PR check for clean-install CI evidence; local result: **42 passed, 10 intentional skips** (duplicate geometry/lifecycle checks and the desktop-only touch exclusion), with no failures.

The truck shares one ramp outline between drawing and tyre-contact calculations. Geometry checks traverse both landscape and portrait courses and verify tyre contact, continuous height/rotation, ascent, descent and flat start/end poses. Browser tests complete all rounds, exercise fast repeated taps, jumping, replay, gentle wrong-colour recovery and reduced motion. Reduced motion preserves ramp contact while disabling jumping and ambient animation.

Recording tests use a generated oscillator stream in place of the microphone, with a guard against accidentally using real microphone input. They exercise the native MediaRecorder, preview, IndexedDB save, reload, actual media playback, export, deletion and restoration in all four browser configurations. A separate lifecycle test verifies that leaving the parent recorder stops microphone tracks. Audio is stored as bytes with its MIME type to avoid Safari Blob persistence failures. No generated test recordings are committed or uploaded.

Both games retain progress, the parental gate, mute preferences and session-limit coverage. The rejected narration files and automatic system speech fallback are removed; spoken lines become available only after a grown-up records or imports them. Visual instructions and chimes remain available without voice recordings.

## Actual rendered screenshots

| Viewport | World | Trucks | Driving | Garden | Parent recorder |
| --- | --- | --- | --- | --- | --- |
| Desktop | [World](screenshots/world-desktop.png) | [Trucks](screenshots/trucks-desktop.png) | [Driving](screenshots/driving-desktop.png) | [Garden](screenshots/garden-desktop.png) | [Recorder](screenshots/recorder-desktop.png) |
| Tablet | [World](screenshots/world-tablet.png) | [Trucks](screenshots/trucks-tablet.png) | [Driving](screenshots/driving-tablet.png) | [Garden](screenshots/garden-tablet.png) | [Recorder](screenshots/recorder-tablet.png) |
| Phone | [World](screenshots/world-mobile.png) | [Trucks](screenshots/trucks-mobile.png) | [Driving](screenshots/driving-mobile.png) | [Garden](screenshots/garden-mobile.png) | [Recorder](screenshots/recorder-mobile.png) |

These are actual screenshots of the production build, not mockups. They show the new outlined wordmark, rendered game assets, ramp traversal and parent recorder. The capture script checks for browser page errors. No private photograph or personal recording appears in the captures.

## Review limits

PR #2 targets `main` and remains unmerged. Browser emulation does not replace physical-device acceptance on iPhone, Android and iPad. The reference-derived character animation frames remain subject to final art review. No Irish voice performance was generated: parents can record their own natural adult voice on their device, or import audio. Five additional worlds, cloud accounts and native packaging remain future work.
