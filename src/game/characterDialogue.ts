/** Actual playback notifications, independent of provider and rendering engine. */
type Speaker = "tiggy" | "benny";
const listeners = new Set<(speaker: Speaker, speaking: boolean) => void>();
export function subscribeCharacterDialogue(
  listener: (speaker: Speaker, speaking: boolean) => void,
) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function characterDialogue(speaker: Speaker, speaking: boolean) {
  listeners.forEach((fn) => fn(speaker, speaking));
}
