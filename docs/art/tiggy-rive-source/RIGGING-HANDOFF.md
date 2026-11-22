> Historical Rive handoff, superseded by the working direct vector animation implementation. The application no longer needs a `.riv` export: see `src/game/TiggyAnimator.ts`, the README and `docs/DELIVERY-CHECKLIST.md`. The original layer audit below remains useful source documentation.

# Tiggy: original artwork and Rive handoff

Status, 22 November 2026: source inspected and grouped; application adapters prepared. **No skeletal rig, constraints, facial controls, animated export or editor state machine has been authored or verified.** The linked editor stayed on “LOADING RIVE” in this environment and no connected Rive authoring tool is available. This repository contains no invented `.riv` file.

## Exact source and inspection

The four SVGs and README were extracted from the user's `Tiggy_Rive_Layered_SVGs.zip`. Their bytes are retained unchanged. `tiggy_neutral_layered.svg` is the sole source used by the application; the three other poses are expression references, not animation frames. No artwork was generated, redrawn or pitch/colour transformed. The original appears in a navy shirt and red shorts: it is used as supplied rather than altered to match earlier outfit briefs.

The neutral file has viewBox `1470 210 1160 2560` and ten top-level groups. `layer-audit.json` records each path's original artboard bounds, fill and index. Important misclassifications:

- `08_facial_features` path 11 is a left thigh, not a facial feature.
- `10_torso_front` path 0 is the mouth, not the torso.
- `09_lower_body_front` path 2 is one continuous shirt-and-sleeves silhouette. Independent shoulder motion requires a deliberate sleeve separation in Illustrator/Rive; the current source does not provide it.
- Each arm already has separate upper arm, forearm, hand and finger-line paths. Each shoe has five independent existing paths.
- Each eye has white, dark eye and highlight paths; brows, nose and mouth are separate existing paths. There are no authored closed-eye, eyelid or talking-mouth controls.
- The neutral mouth is a single closed smile shape. Other mouth drawings remain in the reference poses; closed lips, open mouth interior and deformation controls still require authoring from the user's artwork.

`npm run prepare:rig` creates `tiggy_neutral_rig-prep.svg`: 29 named subgroups, using only existing contiguous paths. The script asserts every path's attributes, transform and paint order remain identical. It does **not** move pivots, attach bones or create animation. Existing parent groups remain to preserve draw order. In Rive, correct semantic parenting without accidentally attaching the misclassified thigh to the head. Maintain draw order separately from bone hierarchy.

## Proposed bone hierarchy and pivot guide (not applied)

Coordinates below are in the original SVG viewBox units, not CSS pixels. They are starting estimates from path bounds; position them visually in the editor before weighting.

| Bone/control    | Parent          | Suggested joint position (x, y) |
| --------------- | --------------- | ------------------------------- |
| root            | artboard        | 2080, 2640                      |
| pelvis          | root            | 2080, 2090                      |
| spine/chest     | pelvis          | 2080, 1700                      |
| neck            | chest           | 2080, 1380                      |
| head            | neck            | 2080, 1320                      |
| left upper arm  | chest           | 1790, 1410                      |
| left forearm    | left upper arm  | 1760, 1720                      |
| left hand       | left forearm    | 1750, 2010                      |
| right upper arm | chest           | 2320, 1410                      |
| right forearm   | right upper arm | 2390, 1700                      |
| right hand      | right forearm   | 2430, 1980                      |
| left thigh      | pelvis          | 1960, 2130                      |
| left shin       | left thigh      | 1950, 2280                      |
| left foot       | left shin       | 1950, 2500                      |
| right thigh     | pelvis          | 2200, 2130                      |
| right shin      | right thigh     | 2220, 2280                      |
| right foot      | right shin      | 2230, 2500                      |

Use two-bone IK targets for hands and feet only where useful, with a consistent bend direction. Test elbows/knees from the neutral pose to avoid flipped solvers. Apply conservative shoulder/hip and elbow/knee rotation limits in local bone coordinates after establishing rest directions; do not blindly copy world-angle limits. Keep feet planted during weight-bearing phases. Keep the head/face together and preserve ear/head stacking. Separate sleeves before weighting their shoulder regions. Split shorts at the leg openings or use controlled deformation; do not stretch a shared silhouette across independently moving legs.

Facial controls to author: left/right eyelid closure, left/right brow rotation, smile amount and mouth opening. Group each eye's three paths together. Avoid scaling the whole eye to simulate an unreviewed blink. Keep the existing head and face silhouette; use reference expressions for smiling/thinking/laughing. These controls are **not present** in the prepared SVG.

## Required exported contract

- Artboard: `Tiggy`.
- State machine: `TiggyController`.
- Eight exact triggers: `Idle`, `Wave`, `Walk`, `Talk`, `Celebrate`, `Thinking`, `Help`, `Happy`.
- Prefer an auto-bound View Model exposing those trigger properties. The adapter also accepts legacy state-machine trigger inputs for an existing project. Do not create numeric inputs with those names.
- Entry → Idle. Idle loops gentle chest breathing and occasional eyelid blink.
- Any State → each action on its named trigger, with brief reviewed transitions. Avoid overlapping transitions that consume the same trigger twice.
- Wave: shoulder/elbow/wrist wave, hand stays attached, one shot → Idle.
- Walk: seamless looping opposite arm/leg movement and planted stance; `Idle` exits.
- Talk: looping mouth opening using the original face. `Idle` exits on actual audio completion/cancellation. This is mouth motion, not phoneme-aligned lip sync.
- Celebrate: short anticipatory crouch, modest jump, raised arms, soft landing → Idle. Do not distort outlines or crop feet/head.
- Thinking: curious head/brow pose → Idle; Help: open-hand asking gesture → Idle; Happy: laughing expression with small shoulder motion → Idle.
- Supply gentle neutral transitions and an interruptible Idle from every looping state. Preserve proportions and consistent line treatment.

Durations are animation-review choices, not hardcoded simulated animations in the application. No Rive listeners should navigate or play audio; existing game and sound controls own those actions.

## Application integration already prepared

`src/game/tiggyRig.ts` defines the contract and leaves `src: null` intentionally. No absent `.riv` URL or runtime download is requested during normal play. Until a reviewed export exists, React and Phaser show the unchanged neutral SVG, honestly static, with existing dialogue/sound and working games preserved. Old generated atlases are not loaded.

`mountTiggyRig` dynamically loads the pinned Canvas runtime only when an export is supplied, uses self-hosted matching WASM, checks the state machine and all eight triggers, and cleans up on errors, timeout, navigation and scene shutdown. Missing/incompatible exports retain the original artwork. Reduced motion retains the static original. Phaser uses a canvas texture at scene coordinates, so it scales with the game rather than using a fixed-position overlay. Pause/resume stops rendering. React pauses when the document is hidden.

Game integration: tapping Tiggy → Wave; successful answers/completion → Celebrate; Garden retry → Help; other activity/truck retries → Thinking. Actual Tiggy dialogue playback → Talk and playback end/cancellation → Idle, without borrowing Benny's voice. Praise does not interrupt celebrations. The parent review page exposes all eight triggers for acceptance, including Walk/Happy which have no automatic gameplay trigger yet. It does not silently replay arbitrary sample animations.

## Export review and activation

1. Finish the above work in the user's Rive project. Do not replace the original art with templates or generated drawings.
2. Export the runtime `.riv` with its artboard, state machine, triggers and embedded assets.
3. Open **Grown-ups → Character rig review**, pass the parent gate and select the `.riv`. It stays local to the device. A successful contract check does not verify bones or movement quality.
4. Test all eight actions on desktop and phone; test looping exits, repeated taps, reduced motion, interruption, pause/resume and loading failures. Inspect feet, sleeves, hand pivots, facial shape and outline consistency. Check the editor bones/constraints separately.
5. Commit the accepted export as `public/assets/tiggy/tiggy.riv`, set `tiggyRig.src` to that asset URL, run build, all browser tests and physical-device acceptance. Do not set the path before the file is present.

The remaining delivery blocker is an actual authored and reviewed Rive export, not the SVG import or an API key. Uploading the `.riv` here allows runtime validation and final integration; a fully editable rig requires editor access/authoring capability beyond this environment.

Official runtime reference: https://rive.app/docs/runtimes/web/rive-parameters and https://rive.app/docs/runtimes/web/low-level-api-usage. Canvas runtime pinned at 2.54.0; matching WASM is copied during prebuild. No external asset CDN is enabled.
