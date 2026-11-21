# Development status

## This rebuild

Implemented: tracked original illustrated map and environments; approved-design transparent Tiggy atlas with seven states; two playable games; articulated monster truck driving and ramp traversal; optional jumping; colour matching; touch and keyboard controls; narration, captions and mute; reduced motion; parental gate; migrated local progress; elapsed-time session gate and scene suspension; build-time asset checks.

## Still unavailable

Little Builders, Tiggy’s Railway, Science Lab, Ready, Set, Go! and Build & Solve are labelled as future areas. No placeholder games are presented as playable.

## Production follow-up

- Art-direction review and animator cleanup of the new reference-derived atlas, including smoother transitions where needed.
- Review local generated voice clips; commission approved performances and original music/ambience.
- Real-device acceptance on iPhone Safari, Android Chrome and iPad beyond browser emulation.
- Supabase parent authentication, child profiles, row-level security and deletion across devices.
- Capacitor packaging and offline asset management.

No Supabase account, backend or child identity is needed for current play. Never place a child's photograph in public assets, commits or screenshots.

## Follow-up: voice, truck and brand

Added a parent-only local voice recorder with preview, save, delete, export and restore. Removed rejected system narration and browser TTS fallback. Replaced the sine-based truck path with tyre contact on a shared rendered ramp, queued tap input and a grounded shadow. Replaced the mixed-font wordmark with a licensed outlined SVG and matching icon.
