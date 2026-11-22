import { promptText } from "./voicePrompts";
export type ActivityId =
  | "builders"
  | "railway"
  | "science"
  | "ready"
  | "blocks"
  | "ferris"
  | "breakfast"
  | "potty";
export type Choice = {
  id: string;
  label: string;
  frame?: number;
  colour?: number;
};
export type ActivityStep = {
  clip: string;
  choices: Choice[];
  correct: string[];
  hint?: number;
  pattern?: number[];
};
const props = {
  bowl: { id: "bowl", label: "Porridge bowl", frame: 4 },
  spoon: { id: "spoon", label: "Spoon", frame: 5 },
  banana: { id: "banana", label: "Banana", frame: 6 },
  toast: { id: "toast", label: "Toast", frame: 7 },
  water: { id: "water", label: "Water", frame: 8 },
  apple: { id: "apple", label: "Apple", frame: 9 },
  soap: { id: "soap", label: "Soap", frame: 10 },
  potty: { id: "potty", label: "Potty", frame: 11 },
  towel: { id: "towel", label: "Towel", frame: 12 },
  pants: { id: "pants", label: "Clean underpants", frame: 13 },
  hands: { id: "hands", label: "Clean hands", frame: 14 },
  sink: { id: "sink", label: "Wash basin", frame: 15 },
  circle: { id: "circle", label: "Circle block", frame: 16 },
  square: { id: "square", label: "Square block", frame: 17 },
  triangle: { id: "triangle", label: "Triangle block", frame: 18 },
  excavator: { id: "excavator", label: "Excavator", frame: 19 },
  crane: { id: "crane", label: "Crane", frame: 20 },
  engine: { id: "engine", label: "Red engine", frame: 21 },
  carriage: { id: "carriage", label: "Blue carriage", frame: 22 },
  magnet: { id: "magnet", label: "Magnet", frame: 23 },
} satisfies Record<string, Choice>;
const shapes = [props.circle, props.square, props.triangle];
const paints = [
  { id: "red", label: "Red paint", colour: 0xef6c63 },
  { id: "yellow", label: "Yellow paint", colour: 0xf4c54c },
  { id: "blue", label: "Blue paint", colour: 0x4fafd4 },
];
const cabins = [
  { id: "red", label: "Red cabin", colour: 0xef6c63 },
  { id: "blue", label: "Blue cabin", colour: 0x4fafd4 },
  { id: "yellow", label: "Yellow cabin", colour: 0xf4c54c },
];
export const activities: Record<
  ActivityId,
  {
    name: string;
    subtitle: string;
    character: "tiggy" | "benny";
    steps: ActivityStep[];
  }
> = {
  builders: {
    name: "Little Builders",
    subtitle: "Find shapes. Build a tower.",
    character: "tiggy",
    steps: [
      {
        clip: "builders-circle",
        choices: shapes,
        correct: ["circle"],
        hint: 16,
      },
      {
        clip: "builders-square",
        choices: shapes,
        correct: ["square"],
        hint: 17,
      },
      {
        clip: "builders-triangle",
        choices: shapes,
        correct: ["triangle"],
        hint: 18,
      },
    ],
  },
  railway: {
    name: "Tiggy’s Railway",
    subtitle: "Build a train, one carriage at a time.",
    character: "tiggy",
    steps: [
      {
        clip: "railway-engine",
        choices: [props.carriage, props.engine, props.excavator],
        correct: ["engine"],
        hint: 21,
      },
      {
        clip: "railway-carriage",
        choices: [props.engine, props.carriage, props.crane],
        correct: ["carriage"],
        hint: 22,
      },
      {
        clip: "railway-another",
        choices: [props.crane, props.engine, props.carriage],
        correct: ["carriage"],
        hint: 22,
      },
    ],
  },
  science: {
    name: "Science Lab",
    subtitle: "Tap two paints. Discover a new colour.",
    character: "tiggy",
    steps: [
      { clip: "mix-orange", choices: paints, correct: ["red", "yellow"] },
      { clip: "mix-green", choices: paints, correct: ["yellow", "blue"] },
      { clip: "mix-purple", choices: paints, correct: ["red", "blue"] },
    ],
  },
  ready: {
    name: "Ready, Set, Go!",
    subtitle: "Stop, wait, then go.",
    character: "tiggy",
    steps: [
      {
        clip: "traffic-red",
        choices: [
          { id: "red", label: "Red light", colour: 0xef6c63 },
          { id: "yellow", label: "Yellow light", colour: 0xf4c54c },
          { id: "green", label: "Green light", colour: 0x4baa85 },
        ],
        correct: ["red"],
      },
      {
        clip: "traffic-yellow",
        choices: [
          { id: "red", label: "Red light", colour: 0xef6c63 },
          { id: "yellow", label: "Yellow light", colour: 0xf4c54c },
          { id: "green", label: "Green light", colour: 0x4baa85 },
        ],
        correct: ["yellow"],
      },
      {
        clip: "traffic-green",
        choices: [
          { id: "red", label: "Red light", colour: 0xef6c63 },
          { id: "yellow", label: "Yellow light", colour: 0xf4c54c },
          { id: "green", label: "Green light", colour: 0x4baa85 },
        ],
        correct: ["green"],
      },
    ],
  },
  blocks: {
    name: "Build & Solve",
    subtitle: "Look at the pattern. Find what comes next.",
    character: "tiggy",
    steps: [
      {
        clip: "pattern-circle",
        choices: shapes,
        correct: ["square"],
        pattern: [16, 17, 16],
      },
      {
        clip: "pattern-triangle",
        choices: shapes,
        correct: ["circle"],
        pattern: [18, 16, 18],
      },
      {
        clip: "pattern-square",
        choices: shapes,
        correct: ["triangle"],
        pattern: [17, 18, 17],
      },
    ],
  },
  ferris: {
    name: "Ferris Wheel",
    subtitle: "Find a cabin. Count your rides.",
    character: "tiggy",
    steps: [
      { clip: "ferris-red", choices: cabins, correct: ["red"] },
      { clip: "ferris-blue", choices: cabins, correct: ["blue"] },
      { clip: "ferris-yellow", choices: cabins, correct: ["yellow"] },
    ],
  },
  breakfast: {
    name: "Benny Bear’s Breakfast",
    subtitle: "Wash, choose a spoon, eat and drink.",
    character: "benny",
    steps: [
      {
        clip: "breakfast-wash",
        choices: [props.soap, props.apple, props.spoon],
        correct: ["soap"],
        hint: 10,
      },
      {
        clip: "breakfast-spoon",
        choices: [props.water, props.spoon, props.toast],
        correct: ["spoon"],
        hint: 5,
      },
      {
        clip: "breakfast-bowl",
        choices: [props.banana, props.towel, props.bowl],
        correct: ["bowl"],
        hint: 4,
      },
      {
        clip: "breakfast-water",
        choices: [props.spoon, props.water, props.apple],
        correct: ["water"],
        hint: 8,
      },
    ],
  },
  potty: {
    name: "Potty Time",
    subtitle: "A gentle routine, at your own pace.",
    character: "tiggy",
    steps: [
      {
        clip: "potty",
        choices: [props.potty, props.bowl, props.spoon],
        correct: ["potty"],
        hint: 11,
      },
      {
        clip: "potty-pants",
        choices: [props.towel, props.pants, props.apple],
        correct: ["pants"],
        hint: 13,
      },
      {
        clip: "wash-hands",
        choices: [props.soap, props.spoon, props.water],
        correct: ["soap"],
        hint: 10,
      },
      {
        clip: "potty-dry",
        choices: [props.pants, props.bowl, props.towel],
        correct: ["towel"],
        hint: 12,
      },
    ],
  },
};
export const activityIds = Object.keys(activities) as ActivityId[];
export const activityPrompt = (id: ActivityId, step: number) =>
  promptText(activities[id].steps[step].clip);
