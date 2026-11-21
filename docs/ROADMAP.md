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

## Child-led adventure world direction (November 2026)

Tiggy is Thiago, the human child guide. Prioritise his interests: cars, trucks, monster trucks, trains, science experiments, building and hands-on problem solving. Create an immersive playable hub rather than a corporate marketing homepage. Keep the accessible, working Colour Garden while adding these activity worlds incrementally:

- **Monster Truck Mayhem:** drive over safe playful obstacles, sort trucks by colour and count wheels; large touch controls and cheerful feedback.
- **Little Builders:** use a digger, crane and dump truck to move blocks, build structures and practise sequencing and spatial vocabulary.
- **Tiggy's Railway:** connect carriages, lay tracks, identify shapes and practise simple ordering.
- **Science Lab:** safe virtual colour mixing, magnets, floating/sinking and cause-and-effect discovery; no dangerous real-world experiment instructions.
- **Ready, Set, Go!:** vehicle sorting, traffic-light colours, simple counting and gentle racing without penalties.
- **Build & Solve:** construction puzzles, stacking, gears and matching.

Prioritise vehicles and construction in the next playable release. Make each activity genuinely interactive and toddler-friendly: big targets, short rounds, no reading required, spoken prompts plus captions, no punitive failure, minimal menus. Include varied interests beyond vehicle themes over time. Do not mark future activities playable until implemented and tested. Visual reference: playful energy and clarity of established preschool games, but use original characters, layouts, assets and branding.
