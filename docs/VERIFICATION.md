# Verification evidence — 22 November 2026

## Current result

The running home and games use a shared, animated original-vector Tiggy puppet. There is no Rive file dependency or character-testing screen in the child journey. The supplied Tiggy’s Kids logo is used on the header, icon and loading screen. The loading screen starts music from a real gesture and waits for actual images and decoding, not a fabricated progress timer.

All ten focused activities remain playable. Ferris passengers, railway cars and the spoon/bowl/mouth/wipe/water feeding flow use real drag-and-drop. The potty routine has eight stages. Accessible tap-to-place and keyboard alternatives remain available without being the primary multiple-choice interface.

## Checks performed

- `npm install`/dependency update: completed; unused Rive runtime and WASM removed.
- `npm run build`: passed, including original asset/private-photo guard and TypeScript.
- `npm run typecheck`: passed. Changed TypeScript/React files pass Prettier checks; `git diff --check` passes.
- Full local Playwright matrix: **126 passed, 10 intentional skips**, across desktop Chromium, tablet Chromium, phone Chromium and phone WebKit (`npm test -- --trace=off`).
- After final speech/body-layer, loading-decoding and vehicle refinements: **36 targeted checks passed** across the same four browser configurations. Earlier final loading/traffic/truck refinements also passed 12 checks.
- Final Ferris free-order placement regression: **eight checks passed**, including genuine mouse/touch wrong-cabin returns and Blue-before-Red completion.
- Final voice gain, approval and recorder regression: **12 checks passed** across all four configurations. The mixer test measures decoded audio signal, verifies body gestures survive speaking, and checks separate persistent levels.
- Provider tooling: **eight mocked contract/privacy checks pass**. No live synthesis request or API key is required for the running app.

The intentional skips are duplicate pure-geometry/lifecycle checks and the desktop-only exclusion for touch-specific input. Browser emulation is not a claim of physical-device acceptance.

## Flow evidence

| Flow                               | Evidence                                                                                                                                                                                                                                                                               |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All character actions visibly move | `character-rig.spec.ts` triggers Idle, Wave, Walk, Talk, Clap, Celebrate, Thinking, Help and Happy on the actual home character and compares rendered pixel hashes between frames. No `.riv`, WASM or generated character atlas is fetched.                                            |
| Facial speech preserves gestures   | `audio-mix.spec.ts` verifies the original character remains in Wave while its separate speaking control is active. Mouth motion can overlay waving/clapping/helping instead of interrupting the body action.                                                                           |
| Ferris play                        | Mouse/touch events drag passengers into colour-matched cabins; a wrong cabin returns the passenger without losing points; all three rides finish. The game character enters Clap and the approved “Well done!” plays.                                                                  |
| Train play                         | Mouse/touch events drag the engine and carriages into coupling slots, then the assembled train departs and the activity completes.                                                                                                                                                     |
| Feeding play                       | Drag soap to hands, spoon into bowl, loaded spoon from bowl to mouth, voluntarily continue after chewing, drag cloth to mouth, offer cup and finish. The turn pause advances only through the explicit continue control; eating is never checked.                                      |
| Potty play                         | All eight recognition/communication/bathroom/clothing/sit/flush/wash/dry stages complete through the shared activity path; free exit, pause and saved progress are verified.                                                                                                           |
| All other games                    | Completion, retries, replay and progress are checked for Builders, Science, Traffic, Patterns, Garden and Trucks. Truck wheel/ramp contact and rapid drive tap queuing retain their regression tests.                                                                                  |
| Logo/loading                       | Fresh-session tests verify the supplied logo, inaccessible background controls during loading, actual progress while an image response is delayed, then a working world/game without missing assets.                                                                                   |
| Sound mix                          | Actual Web Audio gain requests show music ducking from 0.18 to 0.045 during approved speech and restoring afterward. Separate voice/music/effects values persist and reload independently. Voice uses a Web Audio gain stage rather than relying on the media element volume property. |
| Parent/private data                | Gates, progress deletion, scene suspension, session limits, private local recordings/import/export, candidate approval/reload isolation and distinct speakers retain their regression tests.                                                                                           |
| Reduced motion                     | Character pixels remain still while the game remains playable; looping scenery motion is suppressed.                                                                                                                                                                                   |

The touch-drag tests dispatch touch sequences through Phaser’s TouchManager in emulated touch configurations; normal controls use Playwright touch taps. Physical iPhone/iPad/Android touch, listening and performance acceptance remains outstanding.

## Actual rendered evidence

- `loading-{desktop,tablet,mobile}.png`: supplied logo and animated loading welcome.
- `world-{desktop,tablet,mobile}.png`: the illustrated, playable world and original animated Tiggy.
- `{ferris,railway,breakfast,potty}-{desktop,tablet,mobile}.png`: live playfields.
- `tiggy-live-actions.webm`: silent browser recording of the actual gameplay character running its actions; this is not a rendered design mockup. Listen to music/voice in the working app preview.

Loading and world captures use the visible viewport to avoid WebKit full-document capture resizing its `svh` layout; game captures include scrollable controls. All retained game screenshots have been refreshed for the current application. Obsolete static-character and rig-review screenshots were removed; historical evidence remains in Git history.

## Remaining limits

There are **66 unprovided Tiggy dialogue performances and 15 Benny performances**. Fifteen approved Tiggy clips are bundled at original pitch/speed; missing dialogue remains visual and does not borrow another character’s voice. The longer voluntary-turn phrase is visual, accompanied by Tiggy’s existing approved “Your turn!”. Exact scripts/files are in [MISSING-ASSETS.csv](audio/MISSING-ASSETS.csv).

Physical hardware acceptance, cloud parent accounts/profile sync, native packaging and additional minigames within each world remain outside this focused delivery. See [completed versus unfinished checklist](DELIVERY-CHECKLIST.md). No fully voiced curriculum or finished Rive editor rig is claimed; neither is needed to play the current animated activities.

Voice is routed through a shared Web Audio gain stage because [Apple documents that iOS media element volume is not settable in JavaScript](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html). The WebKit regression verifies decoded audio and gain requests; physical-device listening remains outstanding.
