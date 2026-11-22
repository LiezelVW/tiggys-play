/** Export contract only: authoring bones and animations still requires the Rive editor. */
export const tiggyActions = [
  "Idle",
  "Wave",
  "Walk",
  "Talk",
  "Celebrate",
  "Thinking",
  "Help",
  "Happy",
] as const;
export type TiggyAction = (typeof tiggyActions)[number];
export const tiggyRig = {
  // Set to the local exported .riv URL only after editor rig acceptance. No missing-file request.
  src: null as string | null,
  artboard: "Tiggy",
  stateMachine: "TiggyController",
  neutral: "/assets/tiggy/original/tiggy_neutral_layered.svg",
  wasm: "/assets/runtime/rive.wasm",
};
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
  | "happy";
export function rigAction(state: TiggyState): TiggyAction {
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
    } as const
  )[state];
}
