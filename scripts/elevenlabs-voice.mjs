import { readFile, writeFile, stat, readdir, realpath } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  createElevenClient,
  TIGGY_DESCRIPTION,
  privateOutputFolder,
} from "./elevenlabs-client.mjs";
const repo = await realpath(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
);
const [command, ...args] = process.argv.slice(2);
const options = new Map();
for (let i = 0; i < args.length; i++) {
  if (!args[i].startsWith("--")) throw Error("Use named --options.");
  const key = args[i].slice(2);
  options.set(
    key,
    args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : true,
  );
}
if (!["design", "save", "render"].includes(command))
  throw Error(
    "Usage: node scripts/elevenlabs-voice.mjs design|save|render --out /PRIVATE/FOLDER [--voice ID] [--character tiggy|benny] [--voice-approved]",
  );
try {
  process.loadEnvFile(path.join(repo, ".env.local"));
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}
const client = createElevenClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
  projectApproved: process.env.ELEVENLABS_PROJECT_APPROVED === "true",
});
const rawOutput = options.get("out");
if (typeof rawOutput !== "string")
  throw Error("Choose an explicit private --out folder.");
const out = await privateOutputFolder(rawOutput, repo);
async function saveFile(name, value) {
  await writeFile(path.join(out, name), value, { flag: "wx", mode: 0o600 });
}
const approved = options.get("voice-approved") === true;
if (command === "design") {
  if ((await readdir(out)).length)
    throw Error(
      "Choose a fresh empty audition folder to avoid accidentally paying for duplicate previews.",
    );
  const description =
    typeof options.get("description") === "string"
      ? options.get("description")
      : TIGGY_DESCRIPTION;
  const result = await client.design({
    description,
    model: process.env.ELEVENLABS_DESIGN_MODEL || "eleven_ttv_v3",
  });
  const previews = [];
  for (let i = 0; i < result.previews.length; i++) {
    const p = result.previews[i],
      file = `audition-${i + 1}.${p.type.includes("wav") ? "wav" : "mp3"}`;
    await saveFile(file, p.bytes);
    previews.push({
      file,
      generatedVoiceId: p.id,
      duration: p.duration,
      type: p.type,
    });
  }
  await saveFile(
    "auditions.json",
    JSON.stringify(
      {
        provider: "ElevenLabs",
        text: result.text,
        description: result.description,
        model: result.model,
        previews,
        approved: false,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `${previews.length} private auditions saved. Listen before choosing; nothing was activated or published.`,
  );
} else if (command === "save") {
  if (!approved)
    throw Error("Supply --voice-approved only after listening and approval.");
  const manifestPath = options.get("auditions"),
    generatedId = options.get("preview"),
    name = options.get("name");
  if (
    typeof manifestPath !== "string" ||
    typeof generatedId !== "string" ||
    typeof name !== "string"
  )
    throw Error(
      "Provide --auditions FILE --preview RETURNED_ID --name NAME --voice-approved.",
    );
  const auditions = JSON.parse(await readFile(manifestPath, "utf8"));
  if (!auditions.previews?.some((p) => p.generatedVoiceId === generatedId))
    throw Error("That ID is not in the selected audition manifest.");
  try {
    await stat(path.join(out, "selected-voice.json"));
    throw Error(
      "A selected voice already exists in this folder. No new provider voice was created.",
    );
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  const saved = await client.save({
    generatedId,
    name,
    description: auditions.description,
    voiceApproved: true,
  });
  await saveFile(
    "selected-voice.json",
    JSON.stringify(
      {
        provider: "ElevenLabs",
        voiceId: saved.id,
        name: saved.name,
        designModel: auditions.model,
        description: auditions.description,
      },
      null,
      2,
    ) + "\n",
  );
  console.log("Selected voice saved privately. Gameplay remains unchanged.");
} else {
  const voiceId = options.get("voice"),
    character = options.get("character") || "tiggy";
  if (
    typeof voiceId !== "string" ||
    !["tiggy", "benny"].includes(character) ||
    !approved
  )
    throw Error("Provide --voice ID --character tiggy|benny --voice-approved.");
  const library = JSON.parse(
    await readFile(
      path.join(repo, "public/assets/audio/voice-library.json"),
      "utf8",
    ),
  );
  const phrases = library.phrases.filter((p) =>
    p.requiredFor.includes(character),
  );
  const model = process.env.ELEVENLABS_TTS_MODEL || "eleven_v4";
  const run = {
    provider: "ElevenLabs",
    voiceId,
    character,
    model,
    scriptsHash: createHash("sha256")
      .update(JSON.stringify(phrases))
      .digest("hex"),
  };
  const manifest = path.join(out, "generation.json");
  try {
    const previous = JSON.parse(await readFile(manifest, "utf8"));
    if (JSON.stringify(previous) !== JSON.stringify(run))
      throw Error(
        "This folder belongs to another voice/model/script version. Choose a fresh folder.",
      );
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    await saveFile("generation.json", JSON.stringify(run));
  }
  let generated = 0;
  for (const p of phrases) {
    const file = path.join(out, `${p.id}.mp3`);
    try {
      const existing = await stat(file);
      if (existing.size > 0) continue;
      throw Error(
        `An empty recording exists: ${p.id}. Review it before resuming.`,
      );
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
    try {
      const result = await client.speak({
        voiceId,
        text: p.text,
        model,
        voiceApproved: true,
      });
      await saveFile(`${p.id}.mp3`, result.bytes);
      generated++;
    } catch (e) {
      await writeFile(
        path.join(out, "stopped.json"),
        JSON.stringify(
          {
            line: p.id,
            error: e.message,
            note: "No retry/fallback. Review provider history before manually resuming; an uncertain request may have used credits.",
          },
          null,
          2,
        ),
        { mode: 0o600 },
      );
      throw e;
    }
  }
  const clips = await Promise.all(
    phrases.map(async (p) => ({
      id: p.id,
      audio: `data:audio/mpeg;base64,${(await readFile(path.join(out, `${p.id}.mp3`))).toString("base64")}`,
    })),
  );
  await saveFile(
    "candidate-pack.json",
    JSON.stringify(
      {
        format: "tiggys-character-candidate",
        version: 1,
        name:
          typeof options.get("name") === "string"
            ? options.get("name")
            : `${character} — ElevenLabs audition`,
        character,
        provider: `ElevenLabs ${model}`,
        voiceId,
        clips,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `${generated} new clips; ${clips.length} total. Import candidate-pack.json in Grown-ups for review. No gameplay voice was changed.`,
  );
}
