"use client";
import { useSyncExternalStore } from "react";
import { subscribeVoice, voiceCount, voiceRevision } from "../game/recordings";
import {
  subscribeCandidates,
  resolvedVoiceUrl,
  type Character,
} from "../game/voiceCandidates";
function subscribeAll(fn: () => void) {
  const a = subscribeVoice(fn),
    b = subscribeCandidates(fn);
  return () => {
    a();
    b();
  };
}
export function useVoiceAvailable(id: string, character: Character = "tiggy") {
  return useSyncExternalStore(
    subscribeAll,
    () => !!resolvedVoiceUrl(id, character),
    () => false,
  );
}
export function useVoiceCount() {
  return useSyncExternalStore(subscribeVoice, voiceCount, () => 0);
}

export function useVoiceRevision() {
  return useSyncExternalStore(subscribeVoice, voiceRevision, () => 0);
}
