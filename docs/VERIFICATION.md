# Verification evidence

## Current scope

Ten complete, focused activities are playable: Colour Garden, Monster Truck Mayhem, Little Builders, Tiggy’s Railway, Science Lab, Ready Set Go, Build & Solve, Ferris Wheel, Benny Bear’s Breakfast and Potty Time. Each new activity has three/four steps, illustrated choices, gentle retries, completion, replay, home controls and persisted local progress. This is not a claim that each world has multiple completed minigames.

The voice studio imports MP3/WAV dialogue or candidate JSON, previews without activation, supports partial packs with explicit approval, persists the choice per character, restores the prior recording source and supports deletion. It never changes pitch or speed. Tiggy and Benny do not borrow one another’s dialogue. Volume, mute, gesture unlock, preload/cache and natural automatic-dialogue pauses share one manager across games. Missing speech has visual bubbles and optional original chimes.

**15 user-approved cartoon Tiggy performances are bundled.** There are 56 missing Tiggy lines and 10 missing Benny lines. [Every filename and spoken phrase](audio/MISSING-ASSETS.csv) · [Import/approval workflow and provider investigation](audio/VOICE-SYSTEM.md).

## Checks

`npm run build`, the asset/private-photo guard and TypeScript pass. The local full matrix passed **86 tests with 10 intentional skips** (duplicate pure-geometry/lifecycle coverage and the desktop touch exclusion). Final visual refinements at functional commit `52686d5` then passed **16 targeted checks** across all four configurations, including signpost hit targets, Science Lab, Ferris Wheel and Breakfast. The picture shortcut pass also passed four navigation checks. The final separation of personal recordings from approved character packs passed 13 voice/recording checks, with three intentional lifecycle duplicates skipped. Linux CI exposed a fixed-delay input race in Colour Garden: simple matching controls could be pressed before the previous flower animation finished. They now reflect the scene busy state; the test waits for the actual score update. This fix passed 15 garden checks locally, with one intentional desktop-touch skip. The clean-install game build passed [CI at commit 050ff7c](https://github.com/LiezelVW/tiggys-play/actions/runs/44998090363), including npm ci, production build and **86 browser tests with 10 intentional skips**. The subsequent local ElevenLabs preparation client passed eight mocked provider contract/path-privacy tests; no live generation is claimed. The Playwright matrix covers desktop Chromium, tablet Chromium, phone Chromium and phone WebKit. It verifies full activities, wrong-answer recovery, replay, persistence, parent controls, scene suspension, voluntary exit from Potty Time, session limits, reduced motion, ramp geometry, rapid tapping, art loading and overflow.

Voice tests use generated tones rather than anyone’s speech. They exercise native media playback, import without approval, unapproved-pack rejection and partial-pack activation only after confirmation, approval persistence, separate character selection, original playback rate, volume persistence, restore and invalid filenames. Recording tests use a synthetic microphone stream; Linux WebKit without MediaRecorder verifies the real WAV import fallback. No test tone is shipped as dialogue or committed as an audition candidate.

## Rendered evidence

The screenshot script captures the production build at desktop (1440 × 1000), tablet (1024 × 1366) and phone (390 × 844) sizes. The 42 captures include the home world, both original games, ramp traversal, eight added activities, recorder and voice studio. The script checks browser page errors. No private photograph or personal recording is shown.

| Activity | Desktop | Tablet | Phone |
| --- | --- | --- | --- |
| World | [View](screenshots/world-desktop.png) | [View](screenshots/world-tablet.png) | [View](screenshots/world-mobile.png) |
| Colour Garden | [View](screenshots/garden-desktop.png) | [View](screenshots/garden-tablet.png) | [View](screenshots/garden-mobile.png) |
| Monster Truck Mayhem | [View](screenshots/driving-desktop.png) | [View](screenshots/driving-tablet.png) | [View](screenshots/driving-mobile.png) |
| Little Builders | [View](screenshots/builders-desktop.png) | [View](screenshots/builders-tablet.png) | [View](screenshots/builders-mobile.png) |
| Railway | [View](screenshots/railway-desktop.png) | [View](screenshots/railway-tablet.png) | [View](screenshots/railway-mobile.png) |
| Science Lab | [View](screenshots/science-desktop.png) | [View](screenshots/science-tablet.png) | [View](screenshots/science-mobile.png) |
| Ready Set Go | [View](screenshots/ready-desktop.png) | [View](screenshots/ready-tablet.png) | [View](screenshots/ready-mobile.png) |
| Build & Solve | [View](screenshots/blocks-desktop.png) | [View](screenshots/blocks-tablet.png) | [View](screenshots/blocks-mobile.png) |
| Ferris Wheel | [View](screenshots/ferris-desktop.png) | [View](screenshots/ferris-tablet.png) | [View](screenshots/ferris-mobile.png) |
| Benny’s Breakfast | [View](screenshots/breakfast-desktop.png) | [View](screenshots/breakfast-tablet.png) | [View](screenshots/breakfast-mobile.png) |
| Potty Time | [View](screenshots/potty-desktop.png) | [View](screenshots/potty-tablet.png) | [View](screenshots/potty-mobile.png) |
| Voice studio | [View](screenshots/voice-studio-desktop.png) | [View](screenshots/voice-studio-tablet.png) | [View](screenshots/voice-studio-mobile.png) |

## Review limits

PR #2 remains unmerged. The flatter original 2D pass is generated illustration refined from the existing approved design, not hand-drawn artwork by a professional animator or a copy of Lingokids. The new frames need final art/animation review, particularly small badge lettering and transition cleanup. Benny has four reaction drawings; this is not a full skeletal animation rig. Physical iPhone, Android and iPad acceptance remains separate from browser emulation. Cloud accounts, multiple activities per world, native packaging and a shared approved character voice pack remain future work.

## Partial-pack follow-up

The partial approval and stored-speaker loading changes pass a production build and 17 local voice/recording browser checks, with three intentional lifecycle duplicates skipped. The regression seeds an older personal instruction, approves a different partial character voice, reloads, and verifies that the missing instruction stays visual while available praise can play. Private uploaded audio and proposed cuts are not included in Git or the rendered public evidence. The latest full CI status is available in PR #2.

Available praise now cycles through the approved clips that exist instead of falling silent when a preferred praise line is missing. The final voice-studio regression pass completed 12 checks across all four browser configurations. No uploaded recording, automatic transcript or proposed cut was committed.

## Approved uploaded cartoon voice — 22 November 2026

Following explicit user approval, 15 trimmed dialogue WAV files are now bundled as Tiggy’s default on a fresh device. The full source recording, automatic transcript and unrelated private recordings remain excluded. A production build, TypeScript, asset guard and eight provider contract checks pass. Sixteen targeted browser checks pass across desktop/tablet/phone Chromium and phone WebKit: fresh-device greeting and celebration playback, native decoding of all 15 bundled cuts, candidate approval/reload isolation, and personal recording persistence/export/restore. Physical iPhone listening acceptance remains separate from WebKit emulation. No live synthesis call was needed.
