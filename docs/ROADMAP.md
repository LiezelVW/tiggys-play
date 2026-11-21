# Development status

## Foundation and Colour Garden

Implemented: isolated Next.js/TypeScript app; responsive home; provisional brand palette and wordmark; Phaser gameplay boundary; temporary human Thiago rig; three-round colour matching; drag and tap controls; keyboard equivalents; wrong-match retry; positive feedback; captions; bundled temporary narration and audio fallback; mute; completion and replay; parental gate; local progress and deletion; session limit.

Reference-dependent work: approve Café-derived wordmark and Thiago design; replace temporary vectors and voices; finish production sprite/skeletal art. The reference-based branding and recognisable likeness cannot be completed without source references.

## Next phases

3. Expand rig to all specified states, consistent dialogue registry, licensed voice performances, soundscape and approved companions.
4. Build and verify each remaining game separately. Home’s future-world cards are informational, not playable prototypes.
5. Parent authentication, child profile separation, Supabase schema/migrations, row-level security, progress adapter, consent and account deletion. No remote child data exists yet.
6. Capacitor shell, safe-area and orientation checks, iOS/Android audio unlock, native permissions, offline assets, real-device testing, profiling.

## Reference handoff

Provide the Tiggy’s Café brand source and approved cartoon design privately. Keep source photographs outside the repository and public assets. Approved cartoon exports may enter `public/assets/characters`; state mappings should bind to `Character.play` without changing game scoring. Supply front/side/three-quarter views, proportions, palette, outfit details, expression sheet and all requested animation states.
