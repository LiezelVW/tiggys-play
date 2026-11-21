export const voicePrompts = [
  ["tiggy-hello", "Hello! I’m Tiggy. Ready for an adventure?"],
  [
    "world-welcome",
    "Welcome to Tiggy’s Play! Tap the truck to drive, or pick flowers in Colour Garden.",
  ],
  ["intro", "Let’s match the flowers to their colour baskets."],
  ["red", "Put the red flower in the red basket."],
  ["blue", "Put the blue flower in the blue basket."],
  ["yellow", "Put the yellow flower in the yellow basket."],
  ["retry", "Let’s try another basket. You can do it!"],
  ["match", "Wonderful! You found a match."],
  ["complete", "You did it! What a beautiful garden!"],
  ["truck-red", "Find the red truck!"],
  ["truck-blue", "Find the blue truck!"],
  ["truck-yellow", "Find the yellow truck!"],
  ["truck-try-red", "Let’s find the red truck. Try another one!"],
  ["truck-try-blue", "Let’s find the blue truck. Try another one!"],
  ["truck-try-yellow", "Let’s find the yellow truck. Try another one!"],
  ["truck-drive", "Tap the big wheel to drive. Let’s go over the ramp!"],
  ["truck-next", "Brilliant! Let’s find another colour."],
  ["truck-complete", "Amazing driving! You found all three colours!"],
] as const;
export type VoicePromptId = (typeof voicePrompts)[number][0];
