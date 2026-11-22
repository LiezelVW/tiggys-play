// Offline only. No credentials, synthesis, pitch conversion or activation.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
const [folder, name, character = "tiggy", output = "candidate-pack.json"] =
  process.argv.slice(2);
if (!folder || !name || !["tiggy", "benny"].includes(character))
  throw Error(
    'Usage: node scripts/package-voice.mjs CLIPS_FOLDER "Candidate name" tiggy|benny OUTPUT.json',
  );
const library = JSON.parse(
  await readFile("public/assets/audio/voice-library.json", "utf8"),
);
const clips = [],
  missing = [];
for (const p of library.phrases.filter((p) =>
  p.requiredFor.includes(character),
)) {
  let found = false;
  for (const [ext, mime] of [
    ["mp3", "audio/mpeg"],
    ["wav", "audio/wav"],
  ]) {
    let bytes;
    try {
      bytes = await readFile(path.join(folder, `${p.id}.${ext}`));
    } catch (e) {
      if (e.code === "ENOENT") continue;
      throw e;
    }
    if (!bytes.length || bytes.length > 8_000_000)
      throw Error(`Invalid size: ${p.id}.${ext}`);
    clips.push({
      id: p.id,
      audio: `data:${mime};base64,${bytes.toString("base64")}`,
    });
    found = true;
    break;
  }
  if (!found) missing.push(p.id);
}
if (!clips.length)
  throw Error(
    "No matching MP3/WAV files found. See docs/audio/MISSING-ASSETS.csv.",
  );
const pack = JSON.stringify(
  {
    format: "tiggys-character-candidate",
    version: 1,
    name,
    character,
    provider: "Prerecorded import",
    voiceId: "Original character performance",
    clips,
  },
  null,
  2,
);
if (Buffer.byteLength(pack) > 30_000_000)
  throw Error("Pack exceeds 30 MB. Compress the audio first.");
await writeFile(output, pack + "\n");
console.log(
  `${clips.length} clips packaged for audition; not activated. Missing: ${missing.join(", ") || "none"}`,
);
