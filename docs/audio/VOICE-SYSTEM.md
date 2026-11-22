# Character voice workflow

No convincing childlike speech performance is currently available. No new adult narration, pitch shifting, cloning or automatic browser speech fallback has been added. Existing device recordings and preferences remain intact. Importing a candidate never activates it.

## Audition and approval

Open **Grown-ups → Voice preview & approval**. Choose Tiggy or Benny Bear, name a candidate, and import original MP3/WAV files. Each filename matches a phrase ID, for example `well-done.mp3`. Add files to an existing unapproved candidate at any time, or import a JSON candidate pack. Up to four candidates are stored locally. They are not uploaded.

Select any phrase and press **Play candidate** or **Repeat audio**. Playback uses original pitch and 1× speed. Missing clips display the speech bubble and cannot be played. A partial pack can be explicitly approved after listening. The studio reports missing lines; they remain visual instead of borrowing another speaker. Importing alone never activates anything. Explicit approval applies only to this browser/device. It does not commit or publish audio for other children. An approved candidate is read-only. Restore the previous voice before deleting it. The existing parent recorder/export format remains supported independently.

The full Tiggy script library contains 71 lines, including all 29 requested encouragement, communication, learning, self-feeding and potty phrases. Benny’s full script library contains his four breakfast instructions and six encouragement/retry lines (10 files). Benny never borrows Tiggy's voice or the parent's recordings. Other characters can be added as separate character keys when they have playable activities and their own approved performances.

## Exact missing recordings

**71 Tiggy recordings and 10 Benny recordings are missing.** [MISSING-ASSETS.csv](MISSING-ASSETS.csv) lists every filename and exact spoken phrase. These are missing performances, not completed audio assets. The same machine-readable script library is at `public/assets/audio/voice-library.json`.

No synthetic tone fixtures used in automated tests are shipped as dialogue. There are no bundled audition clips presented as approved character voices.

Run `node scripts/export-voice-library.mjs` after editing `src/game/voicePrompts.ts`. To package a directory of prerecorded files without synthesis or network access:

```sh
node scripts/package-voice.mjs /path/to/tiggy-clips "Tiggy candidate A" tiggy /path/to/tiggy-candidate.json
node scripts/package-voice.mjs /path/to/benny-clips "Benny candidate A" benny /path/to/benny-candidate.json
```

The output is audition-only, including partial packs. The script reports missing IDs. You can also import MP3/WAV files directly in the studio without packaging them.

## Audio manager

`src/game/audio.ts` reuses one HTMLAudioElement for dialogue, unlocks it on a real touch/key gesture, explicitly keeps playbackRate at 1, preloads six frequent lines, and uses IndexedDB-backed byte caches and blob URLs. It queues the latest automatic line while a line is playing, with a 1.2-second response pause after completion. Manual replay interrupts immediately. Navigation, parent pause, mute and unmount cancel pending dialogue. No spoken answer or microphone input is required for any game. Sound volume is persisted on the device. Quiet Web Audio chimes are optional.

The ten activities call the same manager. Colour Garden and Monster Truck Mayhem use varied praise when those new lines are available, retaining older partial recordings as fallback. New activities expose visual bubbles, illustrated answer choices, gentle retries, completion and replay. Potty Time has no hurry timer, performance scoring or negative outcome and can be left at any point; the parent's global session limit remains available.

## Provider investigation and current limit

- HeyGen: no private voices exist in the connected workspace. Public searches for child/cartoon voices returned none. A custom original young-character design request failed with HTTP 402 `plan_upgrade_required` on the connected free tier. No custom voice was created, and no retry or substitute voice was generated. [Plan access](https://app.heygen.com/home?surface=codex_plans&utm_source=codex).
- ElevenLabs: Voice Design supports character descriptions, but the public Voice Library excludes childlike voices. No API key is configured. [Voice Design](https://elevenlabs.io/docs/help-center/product/voices/voice-design/what-kind-of-voices-can-i-create-using-voice-design), [Library restriction](https://elevenlabs.io/docs/help-center/product/voices/voice-library/can-childrens-or-child-like-voices-be-added-to-the-voice-library).
- OpenAI: TTS supports delivery instructions and built-in voice choices; its documentation does not establish a guaranteed toddler character voice. No API key is configured. No adult stock voice was substituted. [TTS guide](https://developers.openai.com/api/docs/guides/text-to-speech).

A voice performer or permitted fictional-character synthesis workflow can produce the same MP3/WAV scripts without changing the games. When a provider is used later, generate files outside the browser using server-side credentials; never add a `NEXT_PUBLIC_` provider key or expose a paid generation endpoint to children. This build calls no speech provider at runtime and needs no voice secrets.

## Performance brief for prerecorded dialogue

Tiggy: an original cheerful young cartoon boy, curious and warm, with clear consonants and short natural phrases. Preserve a gentle Irish-English character where the performer can deliver it naturally. Avoid adult narration, exaggerated baby speech, squeakiness and artificial pitch shifting. Benny: a separate friendly, rounded bear character performance, not the same voice renamed. Deliver one clean MP3/WAV per exact script, without background music or spoken stage directions; let the app provide the response pauses. Preview real performances for intelligibility and emotional fit before approving a pack. No recording or likeness of Thiago is needed.

## Progressive voice packs

A partial candidate can be approved explicitly. Only its own available recordings are used; absent lines stay as speech bubbles, including while stored voice selection is loading. An older personal voice never fills holes in a newly approved character pack. The original recordings remain available to restore. Approved packs stay read-only until their selection is restored/revoked, so adding or replacing recordings requires review again. Source uploads, automatic transcripts and proposed clip cuts remain private review artifacts unless the user authorizes publication; auditioning does not establish that the cuts or apparent age are artistically approved.
