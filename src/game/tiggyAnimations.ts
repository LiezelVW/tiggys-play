export type TiggyState =
  "idle" | "blink" | "wave" | "walk" | "jump" | "celebrate" | "talk";
export const tiggyAsset = {
  source: "/assets/tiggy/tiggy-actions-flat.png",
  frameWidth: 320,
  frameHeight: 320,
  columns: 4,
  rows: 6,
  states: {
    idle: [0],
    blink: [0, 1, 2, 3],
    wave: [4, 5, 6, 7, 6, 5, 4],
    walk: [16, 17, 18, 19],
    jump: [20, 21, 22, 23],
    celebrate: [8, 9, 10, 11],
    talk: [12, 13, 14, 13, 15],
  } satisfies Record<TiggyState, number[]>,
};
