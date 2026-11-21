"use client";
import { useSyncExternalStore } from "react";
import {
  subscribeVoice,
  voiceAvailable,
  voiceCount,
  voiceRevision,
} from "../game/recordings";
export function useVoiceAvailable(id: string) {
  return useSyncExternalStore(
    subscribeVoice,
    () => voiceAvailable(id),
    () => false,
  );
}
export function useVoiceCount() {
  return useSyncExternalStore(subscribeVoice, voiceCount, () => 0);
}

export function useVoiceRevision() {
  return useSyncExternalStore(subscribeVoice, voiceRevision, () => 0);
}
