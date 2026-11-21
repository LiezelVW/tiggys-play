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

- **Monster Truck Mayhem:** find each requested colour, tap a truck or use the colour controls, then tap the big wheel (or the arena) to drive over the ramp. Wheels rotate with distance; an optional jump button is also available. Three colours, gentle retries, celebrations, replay and home controls. No lost points or timers during the activity.
- **Colour Garden:** nine flower matches across three rounds, using drag-and-drop or tap a flower then its basket. Keyboard matching buttons are also available. Gentle retries, speech, celebrations and replay are preserved.

Phones use a taller logical playfield with larger flower and basket targets. Both landscape and portrait controls use Phaser’s own scaled coordinates.

The map is a real responsive, pannable scene with visible signpost controls and a persistent two-game play dock. Swipe the map or use its explore controls on small screens. Unavailable worlds are labelled “Growing soon” and have no play buttons. The map's picture and controls live in the same coordinate container; no invisible page-level hit regions are used.

## Character and artwork

Approved cartoon references were supplied in `tiggys-play-character-assets.zip`. Only the two cartoon references were retained in `docs/art`. **Thiago’s photograph was extracted outside the checkout and has never been copied into the repository or public assets.** `.gitignore` and the asset check also reject private-photo filenames.

The approved smooth-haired design is used in a 24-frame transparent atlas. Shared state definitions drive both the home React sprite and Phaser characters: idle, blink, wave, walk, jump, celebrate and talking. These are real frame changes rather than a static SVG moved with CSS. The reference-derived animation frames are new production candidates and should receive art review before a public release; they are not a claim that a professional animator has signed off every frame.

The world, arena, garden and truck art are original generated illustrations; truck wheels are articulated vector graphics over a raster chassis. Paint variants preserve the windscreen and outline. Art provenance, frame layout and remaining work are in [the asset manifest](public/assets/manifest.json). The rejected geometric character files and obsolete marketing/home CSS were removed. The missing `/assets/tiggy/adventure-world.png` dependency was eliminated in favour of a tracked WebP world image.

## Parent controls and privacy

The multiplication gate, local learning progress, mute preference, session limit and progress deletion are preserved. Existing `tiggy-progress.completed` garden counts migrate unchanged; truck completions use an additional `trucks` field. The limit counts elapsed time in the world and both games, pauses behind the parental gate and suspends the Phaser scene and narration. A browser reload starts a fresh session; this is not an OS-level time-control service.

No microphone, recording, advertising, analytics or child identity is collected. Narration uses bundled local WAV clips with optional browser speech fallback; captions and visual instructions always remain available. The media element is reused for Safari’s audio policy. Mute stops narration and sound effects. Reduced-motion preferences suppress ambient motion and character animation and simplify the ramp animation without preventing play.

## Source structure

- `src/components/World.tsx`: illustrated map, available signposts, unavailable landmarks, environmental interactions.
- `src/components/Tiggy.tsx`, `src/game/TiggySprite.ts`, `src/game/tiggyAnimations.ts`: shared character atlas and state system.
- `src/components/MonsterTruck.tsx`, `src/game/TruckScene.ts`, `src/game/TruckSprite.ts`: React controls, Phaser game loop and articulated vehicles.
- `src/components/Garden.tsx`, `src/game/GardenScene.ts`: existing colour game with improved illustrated setting and pause support.
- `src/game/audio.ts`: optional media, Web Audio chimes, speech fallback and cancellation.
- `scripts/verify-assets.mjs`: build-time file checks and private-photo guard.
- `scripts/capture-screenshots.mjs`: screenshots from the rendered production app.
- `tests`: end-to-end gameplay, touch controls, persistence, parent controls, timer, asset loading and overflow checks.

Phaser is lazy-loaded in browser effects and destroyed on navigation. No browser-only game module executes on the server. Game-state feedback is passed to React through callbacks, so later cloud persistence can be added independently.

## Deployment and review

This branch is intended for a pull request. **Do not merge or promote production before review.** In Vercel, use the repository root, Next.js framework preset, `npm ci` and `npm run build`; leave the output directory at the framework default. No environment variables are needed for these two games. A GitHub PR may create a preview through an existing Vercel integration; this change does not modify production settings.

See [verification evidence](docs/VERIFICATION.md) for build/test results and screenshots. Parent accounts, Supabase progress across devices, the five unavailable worlds, native Capacitor builds, background music and final licensed voice performances remain future work. Local macOS-generated narration is included for reliable playback and should be reviewed alongside the new artwork before public release.
