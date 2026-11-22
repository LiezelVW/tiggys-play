import { readFile, writeFile, mkdir } from "node:fs/promises";
const source = await readFile("src/game/voicePrompts.ts", "utf8");
const pairs = [
  ...source.matchAll(/\[\s*"([^"\n]+)",\s*"([^"\n]+)"\s*,?\s*\]/g),
].map((m) => ({ id: m[1], text: m[2] }));
if (pairs.length < 47 || new Set(pairs.map((p) => p.id)).size !== pairs.length)
  throw Error("Invalid phrase library.");
const benny = [
  "breakfast-wash",
  "breakfast-spoon",
  "breakfast-bowl",
  "breakfast-water",
  "breakfast-scoop",
  "breakfast-feed",
  "breakfast-wipe",
  "breakfast-done",
  "breakfast-your-turn",
  "try-again",
  "well-done",
  "you-did-it",
  "yay",
  "good-job",
  "amazing",
];
const approved = Object.fromEntries(
  [
    ...(await readFile("src/game/approvedVoice.ts", "utf8")).matchAll(
      /(?:"([^"]+)"|([\w-]+)):\s*"(\/assets\/audio\/[^"\n]+)"/g,
    ),
  ].map((m) => [m[1] || m[2], m[3]]),
);
if (
  !Object.keys(approved).length ||
  Object.keys(approved).some((id) => !pairs.some((p) => p.id === id))
)
  throw Error("Approved voice clips must reference known phrase IDs.");
const phrases = pairs.map((p) => ({
  ...p,
  requiredFor: ["tiggy", ...(benny.includes(p.id) ? ["benny"] : [])],
  file: `${p.id}.mp3`,
  approvedTiggyAsset: approved[p.id] || null,
  status: approved[p.id]
    ? "approved-tiggy-performance"
    : "missing-approved-performance",
}));
await mkdir("docs/audio", { recursive: true });
await mkdir("public/assets/audio", { recursive: true });
await writeFile(
  "public/assets/audio/voice-library.json",
  JSON.stringify({ version: 1, phrases }, null, 2) + "\n",
);
await writeFile(
  "docs/audio/MISSING-ASSETS.csv",
  "Character,Filename,Exact spoken text,Status\n" +
    phrases
      .flatMap((p) =>
        p.requiredFor
          .filter((c) => c !== "tiggy" || !approved[p.id])
          .map((c) =>
            [c, p.file, p.text, "missing-approved-performance"]
              .map((s) => '"' + s.replaceAll('"', '""') + '"')
              .join(","),
          ),
      )
      .join("\n") +
    "\n",
);
console.log(
  `${phrases.length} Tiggy scripts, ${benny.length} Benny scripts. ${Object.keys(approved).length} approved Tiggy clips bundled; ${phrases.length - Object.keys(approved).length} Tiggy and ${benny.length} Benny clips missing.`,
);
