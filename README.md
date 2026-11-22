# Tiggy’s Play

An illustrated educational adventure playground built with Next.js, TypeScript, React and Phaser 3. Thiago **is** Tiggy: the human toddler in a navy hoodie and yellow construction vest. No tiger character is used.

## Run and verify

Node.js 22.14+ and npm are required. No secrets or cloud services are needed.

```sh
npm ci
npm run build
npm start
```

Open http://localhost:3000. For development, use `npm run dev`.

```sh
npm run typecheck
npm run check:assets
npx playwright install chromium webkit
npm test
```

Playwright starts the **production** build on port 3100. Build first. The browser suite covers desktop Chromium, tablet Chromium, phone Chromium and phone WebKit. It verifies the actual interactive UI, not just the matching functions. Browser emulation is not a substitute for final testing on physical iPhones, Android devices and iPads.

## Playable adventures

- **Monster Truck Mayhem:** find each requested colour, tap a truck or use the colour controls, then tap the big wheel (or the arena) to drive over the ramp. Both wheels follow the same visible ramp outline used by the renderer. Chassis tilt comes from tyre contact, wheel rotation follows travel, and rapid taps queue movement. An optional jump button is also available. Three colours, gentle retries, celebrations, replay and home controls. No lost points or timers during the activity.
- **Colour Garden:** nine flower matches across three rounds, using drag-and-drop or tap a flower then its basket. Keyboard matching buttons are also available. Gentle retries, speech, celebrations and replay are preserved.

- **Little Builders:** choose a circle, square and triangle to construct a tower.
- **Tiggy’s Railway:** sequence an engine and two carriages.
- **Science Lab:** combine two paints to discover orange, green and purple.
- **Ready, Set, Go!:** identify stop, wait and go traffic lights.
- **Build & Solve:** finish three alternating shape patterns.
- **Ferris Wheel:** choose the requested coloured cabins, rotate the wheel and count three rides.
- **Benny Bear’s Breakfast:** practise washing, finding a spoon, choosing porridge and drinking water with Benny’s frame reactions.
- **Potty Time:** practise recognising the potty, clean pants, soap and towel. No pressure or time challenge; an All done control allows leaving at any point.

Each new adventure has three or four steps, illustrated choices, gentle retries, completion, replay, home navigation and persisted local progress. These are focused replayable activities, not a claim that every world contains multiple finished minigames.

Phones use a taller logical playfield with larger flower and basket targets. Both landscape and portrait controls use Phaser’s own scaled coordinates.

The map is a real responsive, pannable scene with visible signpost controls and a horizontally scrollable activity dock. Swipe the map or use its explore controls on small screens. All ten listed adventures have an end-to-end activity. The map's picture and controls live in the same coordinate container; no invisible page-level hit regions are used.

## Character and artwork

Approved cartoon references were supplied in `tiggys-play-character-assets.zip`. Only the two cartoon references were retained in `docs/art`. **Thiago’s photograph was extracted outside the checkout and has never been copied into the repository or public assets.** `.gitignore` and the asset check also reject private-photo filenames.

The approved smooth-haired design is used in a 24-frame transparent atlas. Shared state definitions drive both the home React sprite and Phaser characters: idle, blink, wave, walk, jump, celebrate and talking. These are real frame changes rather than a static SVG moved with CSS. The reference-derived animation frames are new production candidates and should receive art review before a public release; they are not a claim that a professional animator has signed off every frame.

The world, arena, garden and truck art are original generated illustrations; truck wheels are articulated vector graphics over a raster chassis. Paint variants preserve the windscreen and outline. Art provenance, frame layout and remaining work are in [the asset manifest](public/assets/manifest.json). The rejected geometric character files and obsolete marketing/home CSS were removed. The missing `/assets/tiggy/adventure-world.png` dependency was eliminated in favour of a tracked WebP world image.

## Parent controls and privacy

The multiplication gate, local learning progress, mute preference, session limit and progress deletion are preserved. Existing `tiggy-progress.completed` garden counts migrate unchanged; truck completions use an additional `trucks` field. The limit counts elapsed time in the world and every game, pauses behind the parental gate and suspends the Phaser scene and narration. A browser reload starts a fresh session; this is not an OS-level time-control service.

No advertising, analytics or child identity is collected. Optional adult voice recording is available only behind the parental gate. The microphone starts only after pressing Record, stops on exit or after 15 seconds, and recordings are saved locally in IndexedDB only after review and Save. They can be deleted or exported/restored as a voice pack; no audio is uploaded. The rejected system narration and browser speech fallback have been removed. Captions and visual instructions always remain available. The media element is reused for Safari’s audio policy. Mute stops narration and sound effects. Reduced-motion preferences suppress ambient motion and character animation and jumping; the tyres still follow the same ramp geometry.

## Source structure

- `src/components/World.tsx`: illustrated map, available signposts, activity shortcuts, environmental interactions.
- `src/components/Tiggy.tsx`, `src/game/TiggySprite.ts`, `src/game/tiggyAnimations.ts`: shared character atlas and state system.
- `src/components/MonsterTruck.tsx`, `src/game/TruckScene.ts`, `src/game/TruckSprite.ts`: React controls, Phaser game loop and articulated vehicles.
- `src/components/Garden.tsx`, `src/game/GardenScene.ts`: existing colour game with improved illustrated setting and pause support.
- `src/game/audio.ts`: parent-recorded media, quiet Web Audio chimes and playback cancellation.
- `scripts/verify-assets.mjs`: build-time file checks and private-photo guard.
- `scripts/capture-screenshots.mjs`: screenshots from the rendered production app.
- `tests`: end-to-end gameplay, touch controls, persistence, parent controls, timer, asset loading and overflow checks.

Phaser is lazy-loaded in browser effects and destroyed on navigation. No browser-only game module executes on the server. Game-state feedback is passed to React through callbacks, so later cloud persistence can be added independently.

## Deployment and review

This branch is intended for a pull request. **Do not merge or promote production before review.** In Vercel, use the repository root, Next.js framework preset, `npm ci` and `npm run build`; leave the output directory at the framework default. No environment variables are needed for current play. A GitHub PR may create a preview through an existing Vercel integration; this change does not modify production settings.

To refresh screenshots, run `npm run start -- --port 3100` in one terminal and `node scripts/capture-screenshots.mjs` in another.

See [verification evidence](docs/VERIFICATION.md) for build/test results and screenshots. Parent accounts, Supabase progress across devices, native Capacitor builds, background music and a shared professionally recorded voice pack remain future work. Parents can record their own adult voice now; the app does not synthesize or clone it. Character candidates are auditioned separately and never become active without explicit parent approval.

## Record your voice

Open **Grown-ups**, pass the gate, then select **Record Tiggy’s voice**. Choose a line, press Record, allow the browser microphone permission, and Stop when finished. Listen back and select **Use this recording**. Repeat for the other lines. Recordings are private to this browser/device. **Export voice pack** makes a local backup; **Restore an exported voice pack** transfers your recordings to another browser/device. Exporting does not upload or delete your recordings.

The recorder uses MediaRecorder with a supported browser-native audio format. Audio import, per-line deletion and deletion of all recordings are also available. No child-facing screen requests microphone access. The original AI/system voice files and automatic speech synthesis were removed.

## Logo

The header now uses an outlined SVG wordmark and matching T/play monogram. There are no external font requests or italic/serif mismatch. Source lettering is Outfit under its bundled SIL OFL licence (`docs/art/brand-font`). To rebuild the SVGs, install Python `fonttools` in a development virtual environment and run `python scripts/build-logo.py`.

## Character voice studio and missing audio

Open **Grown-ups → Voice preview & approval**. Import MP3/WAV clips by phrase filename, or audition candidate packs. Import and preview do not change the selected gameplay voice. Only an explicit approval of a complete pack activates it on this device. Tiggy and Benny are separate speakers; no missing line borrows another character’s voice. Previous local recordings are preserved. Volume and mute are available in Grown-ups.

All 29 requested speech-development phrases are scripted, alongside game dialogue. **71 Tiggy performances and 10 Benny performances are still missing.** No replacement adult narration or pitch-shifted audition is bundled. Every game works with visual speech bubbles and optional sound effects while voice assets are missing. [Exact asset checklist](docs/audio/MISSING-ASSETS.csv) · [Voice workflow and provider investigation](docs/audio/VOICE-SYSTEM.md).

## Flat 2D direction

The active map, garden, arena, character frames and object atlas use a cleaner, flatter 2D pass with simpler contours and less texture/shading. Existing runtime vehicle geometry and touch targets remain aligned. Benny has four original expression/action frames. Ferris Wheel is drawn and animated in Phaser; its cabins stay upright as the wheel turns. Superseded textured files are retained for provenance, not used by the main experience. This remains original art, not Lingokids assets. Final character/badge cleanup and professional animator review are still required before a production-quality art sign-off.

## ElevenLabs preparation

The requested ElevenLabs provider has a local, credential-private workflow for text-only fictional voice auditions, selecting a returned candidate and rendering prerecorded dialogue. It does not upload family recordings/photos, expose a browser key, substitute a stock adult narrator or activate a voice automatically. Configure access privately and confirm permitted project use first. See [ElevenLabs setup and commands](docs/audio/ELEVENLABS.md). Run `npm run test:voice-provider` for the mocked API contract checks; no live provider generation has been verified yet.
