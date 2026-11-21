export const colours = [
  { name: "red", hex: 0xe16c58, css: "#e16c58", label: "Red" },
  { name: "blue", hex: 0x559db9, css: "#559db9", label: "Blue" },
  { name: "yellow", hex: 0xefbd45, css: "#efbd45", label: "Yellow" },
] as const;
export type Colour = (typeof colours)[number]["name"];
export const rounds: Colour[][] = [
  ["red", "blue", "yellow"],
  ["yellow", "red", "blue"],
  ["blue", "yellow", "red"],
];
export function matches(object: Colour, basket: Colour) {
  return object === basket;
}
export const TOTAL = rounds.flat().length;
