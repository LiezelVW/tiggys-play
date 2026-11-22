# ElevenLabs voice preparation

ElevenLabs is the requested provider. This integration prepares prerecorded files locally; no speech API key, live generation endpoint or private recording is exposed to the child-facing app. Mum’s uploaded recordings remain outside Git/public assets and are not used for cloning or generation. No ElevenLabs request has been made with real credentials yet.

## Current access requirement

No ElevenLabs connector or API credential was found in this workspace. The provider's current [Use Policy](https://elevenlabs.io/use-policy), updated 9 October 2026, requires written approval for apps directed at under-18s and states that its policy also covers offline/on-device use. It does not specify a private or non-commercial exemption to that requirement. The [shared Voice Library restriction](https://elevenlabs.io/docs/help-center/product/voices/voice-library/can-childrens-or-child-like-voices-be-added-to-the-voice-library) concerns sharing childlike voices in that Library; it should not be confused with a blanket statement about every private fictional voice-design workflow.

Use the integration only when ElevenLabs confirms that the intended project use is permitted. `ELEVENLABS_PROJECT_APPROVED=true` is an operator acknowledgment, not proof of approval or a provider entitlement. This code does not bypass refusals, clone a real minor or automatically substitute an adult voice.

## Private setup

Copy `.env.example` to an ignored `.env.local` and set `ELEVENLABS_API_KEY` there, never in chat or a `NEXT_PUBLIC_` variable. Confirm permitted use before setting `ELEVENLABS_PROJECT_APPROVED=true`. Models are configurable; the documented defaults are `eleven_ttv_v3` for original voice design and `eleven_v4` for high-quality speech. No account upgrade or purchase is performed by these tools. Provider calls use account credits.

## 1. Make private auditions

After account access/use permission is ready:

```sh
node scripts/elevenlabs-voice.mjs design --out /private/path/tiggy-auditions
```

Choose a fresh, empty folder outside this checkout. This sends only an original fictional-character description and a short script of approved words. It uploads no recording or photograph. The provider returns preview audio and provisional IDs; the command saves the original bytes, exact audition script, model, description and IDs in `auditions.json`. Listen to all returned samples before choosing. No voice is saved to the provider account or activated in the game at this step. Naturalness and apparent age require listening; passing an API response check is not an artistic review.

The default brief is a cheerful fictional young boy with a gentle Irish-English delivery, clear pronunciation and restrained enthusiasm, without adult narration, squeakiness, pitch conversion or imitation of a real person. For Benny, use a separate original friendly bear description with `--description` and a separate approved voice ID.

## 2. Save only the chosen voice

After listening and explicitly approving a particular candidate:

```sh
node scripts/elevenlabs-voice.mjs save --auditions /private/path/tiggy-auditions/auditions.json --preview RETURNED_PREVIEW_ID --name "Tiggy chosen candidate" --voice-approved --out /private/path/tiggy-selected
```

This creates one provider voice from an actual returned provisional ID. `selected-voice.json` records the saved voice ID. It does not alter gameplay. A fresh output file is required before another paid/account mutation; the tool does not overwrite a previously selected voice.

## 3. Render the phrase library

Once the voice itself is approved, use its saved ID:

```sh
node scripts/elevenlabs-voice.mjs render --voice SAVED_VOICE_ID --character tiggy --name "Tiggy candidate A" --voice-approved --out /private/path/tiggy-dialogue
```

For Benny, choose `--character benny` with his own voice ID. The command renders the canonical 71 Tiggy or 10 Benny lines sequentially and saves MP3 files plus `candidate-pack.json`. The original speed is 1; there is no pitch manipulation, denoising, stretching or fallback speaker. The generation manifest binds files to the voice, model and exact script version, preventing accidental mixing when resuming a partially completed folder. Existing successful files are reused. On any error, generation stops without retry; `stopped.json` identifies the line. Check provider history before manually rerunning an uncertain request, because it may have consumed credits.

Import the generated pack in **Grown-ups → Voice preview & approval**, listen again and explicitly approve it for this device. The generated pack is never automatically committed, published or selected. Existing recordings and the currently selected voice stay intact until the parent chooses a replacement. Games remain playable through speech bubbles and optional sound effects throughout.

## Tests and limits

`npm run test:voice-provider` verifies request contracts, private credential/permission gates, explicit voice approval, unchanged audio bytes, original speed, refusals, non-audio responses, no automatic retries and credential-safe errors using mocked HTTP responses. These tests do not claim a successful live ElevenLabs generation or a convincing childlike performance. The final voice must be judged from real samples and approved by the user.

Primary API references: [Voice Design](https://elevenlabs.io/docs/api-reference/text-to-voice/design), [Save designed voice](https://elevenlabs.io/docs/api-reference/text-to-voice/create), [Create speech](https://elevenlabs.io/docs/api-reference/text-to-speech/convert), [Models](https://elevenlabs.io/docs/overview/models).

## Information to give ElevenLabs when checking permitted use

Describe a parent-operated private, non-commercial family app for ages 2–6, using fixed prerecorded educational phrases rather than a live child-facing chatbot. Request permission for an original fictional young cartoon voice, with no real child recordings, likeness conditioning or cloning. Ask which account/model terms and attribution requirements apply to that private use. This repository does not send that request on your behalf.

Partial prerecorded packs can also be auditioned and explicitly approved before the full library is ready. Missing phrases remain visual. This does not require a live speech API or a browser API key.
