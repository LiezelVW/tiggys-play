# Tiggy’s Play — Play • Learn • Grow

Phase 1 foundation and Phase 2 playable Colour Garden. Thiago **is** Tiggy, a human child. There is no tiger mascot.

## Repository inspection

The supplied workspace contained DBFL 3D demos and a Christmas project, not a Tiggy’s Play repository. No Tiggy’s Café logo, Thiago photograph, approved character artwork or existing Tiggy tiger mascot was found. This independent `tiggys-play` directory preserves all existing projects. Its wordmark and vector human study are provisional, not reproductions of missing references.

## Run

Requires Node.js 22.14+ and npm.

```sh
cd tiggys-play
npm ci
npm run dev
```

Open http://localhost:3000. No credentials are required. For production, run `npm run build` followed by `npm start`.

```sh
npm run typecheck
npx playwright install chromium
npm test
```

Tests exercise desktop and mobile Chromium viewports. They cover three-round completion, replay, saved completion counts, wrong-basket retries, tap-to-place, the parent gate, settings and deletion. These do not establish real iOS Safari/audio behavior; test on physical devices before release.

## What is playable

Choose Colour Garden from the home page. Match nine flowers over three rounds using drag-and-drop, or tap a flower then its matching basket. Keyboard controls are available below the game. Retries never remove progress. Thiago reacts to taps, successful matches and retries. The final celebration supports replay and return home.

The other displayed worlds are explicitly marked “Growing soon” and are not presented as completed games. No microphone, account, advertising, analytics, network learning store or child name is used. The grown-up area has a multiplication gate, device-only completion counts, mute, session length settings and local progress deletion. It is a child-facing gate, not authentication. A session time limit pauses access behind a grown-up gate; it is not an operating-system screen-time service and resets on page reload.

## Architecture

- `src/app`: Next.js App Router, TypeScript, Tailwind entry, responsive design and Motion card interaction.
- `src/components/Garden.tsx`: React lifecycle boundary, lazy Phaser loading, instructions, accessible controls and completion dialog.
- `src/game/GardenScene.ts`: Phaser 3 scene, touch/mouse input, matching, snap animation, rounds and reporting.
- `src/game/Character.ts`: reusable articulated temporary rig with idle breathing, blink, wave, think and celebrate states. Not a finished animation set.
- `src/game/rules.ts`: shared colour definitions and matching rules.
- `src/game/audio.ts`: bundled WAV dialogue, optional browser speech fallback, Web Audio chimes and mute.
- `public/assets/manifest.json`: asset provenance and exact replacement requirements.

Phaser only imports in the browser. Scene teardown destroys its canvas, events and tweens. Audio stops on leaving the game. All dialogue has captions; blocked or unavailable audio does not block progression. No recordings are made. Completion counts and settings stay in this browser’s local storage. Future cloud work must use a separate progress adapter rather than embedding database calls in Phaser scenes.

## Artwork and audio status

**Missing inputs:** Tiggy’s Café logo and approved Thiago cartoon reference. No identifiable likeness is claimed. Home SVG and Phaser rig are temporary original vector studies sharing a palette and outfit. Gameplay uses separately animated body parts rather than a CSS-translated static illustration. The small home illustration is a temporary SVG preview, not final sprite animation.

Animation still required: walk, run, jump, point, talk, laugh, dance, sit and object-specific reactions; approved character sheets and final sprite/skeletal exports. Companion characters, music and background ambience are not finished. The eight bundled narration clips were generated using macOS Samantha at 155 words/minute as temporary offline dialogue. Replace with approved, licensed child-friendly voice performances before public release. A professional brand review should follow receipt of the Café logo. Never add the child’s photographs to `public/` or Git.

## GitHub and Vercel

This project runs locally and has not been pushed or deployed. To publish, use an owned GitHub repository and import it into Vercel. If importing this containing workspace, set Vercel’s Root Directory to `tiggys-play`. Framework: Next.js; install: `npm ci`; build: `npm run build`; output: framework default. No environment variables are needed in Phases 1–2. Review temporary art and narration before making the deployment public. `.gitignore` excludes secrets and generated build/test files.

Supabase parent authentication, child profiles, protected progress and deletion across devices are **Phase 5**, not implemented or simulated. Configure secrets through Vercel environment settings when that phase is built; do not place service-role credentials in browser code. Capacitor packaging, offline caching and native permissions are Phase 6; the browser-only game/audio boundary supports that future integration but no mobile binary is included.
