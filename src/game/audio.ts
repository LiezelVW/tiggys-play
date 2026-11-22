import {
  unlockAmbience,
  duckMusic,
  setSoundscapeMuted,
  gentleEffect,
  connectVoice,
  setVoiceMixVolume,
} from "./soundscape";
export { gentleEffect } from "./soundscape";
import { characterDialogue } from "./characterDialogue";
import { resolvedVoiceUrl, type Character } from "./voiceCandidates";
let muted = false,
  volume = 0.7;
let current: HTMLAudioElement | null = null;
let currentKey = "";
let speakingCharacter: Character | undefined;
function endDialogue() {
  duckMusic(false);
  if (speakingCharacter) characterDialogue(speakingCharacter, false);
  speakingCharacter = undefined;
}
let revision = 0,
  unlocked = false,
  playing = false,
  responseUntil = 0;
let pending: ReturnType<typeof setTimeout> | undefined;
let queued: (() => void) | undefined;
const preloaded = new Map<string, HTMLAudioElement>();
const SILENCE =
  "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAAAAA==";
export function setMuted(value: boolean) {
  setSoundscapeMuted(value);
  muted = value;
  if (value) stopAudio();
}
export function setVolume(value: number) {
  volume = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0.7;
  setVoiceMixVolume(volume);
  if (current) current.volume = connectVoice(current) ? 1 : volume;
}
/** Called synchronously in a real touch/key gesture. Keep this single media element for iOS. */
export function unlockAudio() {
  unlockAmbience();
  if (unlocked) return;
  current ??= new Audio();
  if (playing) return;
  const request = revision;
  current.src = SILENCE;
  current.volume = connectVoice(current) ? 1 : volume;
  void current
    .play()
    .then(() => {
      unlocked = true;
      if (request === revision) current?.pause();
    })
    .catch(() => {
      /* A later real gesture can retry. */
    });
}
/** Preload only the frequently used lines; complete packs are already cached in IndexedDB/memory. */
export function preloadVoice() {
  const sources = [
    "lets-play",
    "well-done",
    "you-did-it",
    "yay",
    "try-again",
    "all-done",
  ]
    .map((id) => resolvedVoiceUrl(id))
    .filter((v): v is string => !!v);
  for (const [src, a] of preloaded)
    if (!sources.includes(src)) {
      a.removeAttribute("src");
      a.load();
      preloaded.delete(src);
    }
  for (const src of sources)
    if (!preloaded.has(src)) {
      const a = new Audio();
      a.preload = "auto";
      a.src = src;
      a.load();
      preloaded.set(src, a);
    }
}
export function chime(success = true) {
  if (!muted && success) gentleEffect("success");
}

function flushQueued() {
  if (!queued) return;
  const next = queued;
  queued = undefined;
  pending = setTimeout(
    () => {
      pending = undefined;
      next();
    },
    Math.max(0, responseUntil - Date.now()),
  );
}
export function playVoiceSource(
  src: string,
  onError?: () => void,
  character?: Character,
) {
  stopAudio();
  if (muted || volume === 0) return;
  const request = revision;
  current ??= new Audio();
  current.volume = connectVoice(current) ? 1 : volume;
  current.playbackRate = 1;
  current.src = src;
  playing = true;
  current.onended = () => {
    if (request !== revision) return;
    playing = false;
    endDialogue();
    responseUntil = Date.now() + 1200;
    flushQueued();
  };
  const failed = () => {
    if (request !== revision) return;
    playing = false;
    endDialogue();
    queued = undefined;
    onError?.();
  };
  current.onerror = failed;
  void current
    .play()
    .then(() => {
      unlocked = true;
      if (request === revision) duckMusic(true);
      if (request === revision && character) {
        speakingCharacter = character;
        characterDialogue(character, true);
      }
    })
    .catch(failed);
}
export function speak(
  _text: string,
  clip?: string,
  character: Character = "tiggy",
) {
  const src = clip ? resolvedVoiceUrl(clip, character) : undefined;
  if (!src) {
    stopAudio();
    return;
  }
  playVoiceSource(src, undefined, character);
  currentKey = `${character}:${clip}`;
}
/** Automatic dialogue leaves room to answer; replay taps always play immediately. */
export function narrate(
  text: string,
  clip: string,
  character: Character = "tiggy",
) {
  if (muted || !resolvedVoiceUrl(clip, character)) return;
  if (playing && currentKey === `${character}:${clip}`) return;
  if (playing || responseUntil > Date.now()) {
    queued = () => speak(text, clip, character);
    if (!playing) {
      if (pending) clearTimeout(pending);
      flushQueued();
    }
  } else speak(text, clip, character);
}
export function stopAudio() {
  endDialogue();
  currentKey = "";
  revision++;
  playing = false;
  responseUntil = 0;
  queued = undefined;
  if (pending) clearTimeout(pending);
  pending = undefined;
  current?.pause();
  if (current) {
    current.onerror = null;
    current.onended = null;
  }
  if ("speechSynthesis" in window) speechSynthesis.cancel();
}
