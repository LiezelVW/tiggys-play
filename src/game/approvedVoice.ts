/** User-approved uploaded cartoon performance. Original pitch and speed; trimmed dialogue only. */
export const approvedVoice = {
  "all-done": "/assets/audio/tiggy-approved-v1/all-done.wav",
  "count-three": "/assets/audio/tiggy-approved-v1/count-three.wav",
  go: "/assets/audio/tiggy-approved-v1/go.wav",
  "help-please": "/assets/audio/tiggy-approved-v1/help-please.wav",
  "lets-play": "/assets/audio/tiggy-approved-v1/lets-play.wav",
  "more-please": "/assets/audio/tiggy-approved-v1/more-please.wav",
  "my-turn": "/assets/audio/tiggy-approved-v1/my-turn.wav",
  potty: "/assets/audio/tiggy-approved-v1/potty.wav",
  "thank-you": "/assets/audio/tiggy-approved-v1/thank-you.wav",
  "try-again": "/assets/audio/tiggy-approved-v1/try-again.wav",
  "well-done": "/assets/audio/tiggy-approved-v1/well-done.wav",
  yay: "/assets/audio/tiggy-approved-v1/yay.wav",
  "you-did-it": "/assets/audio/tiggy-approved-v1/you-did-it.wav",
  "your-turn": "/assets/audio/tiggy-approved-v1/your-turn.wav",
  yummy: "/assets/audio/tiggy-approved-v1/yummy.wav",
} as const;
export function approvedVoiceUrl(id: string): string | undefined {
  return approvedVoice[id as keyof typeof approvedVoice];
}
