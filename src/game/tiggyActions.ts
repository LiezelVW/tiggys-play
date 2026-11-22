import type { CharacterAction } from "./tiggyPose";
export type TiggyState =
  | "idle"
  | "blink"
  | "wave"
  | "walk"
  | "jump"
  | "celebrate"
  | "talk"
  | "thinking"
  | "help"
  | "happy"
  | "clap"
  | "sit";
export function characterAction(state: TiggyState): CharacterAction {
  return (
    {
      idle: "Idle",
      blink: "Idle",
      wave: "Wave",
      walk: "Walk",
      jump: "Celebrate",
      celebrate: "Celebrate",
      talk: "Talk",
      thinking: "Thinking",
      help: "Help",
      happy: "Happy",
      clap: "Clap",
      sit: "Sit",
    } as const
  )[state];
}
