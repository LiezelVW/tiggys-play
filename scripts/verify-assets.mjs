import { readdir, readFile, access } from "node:fs/promises";
import path from "node:path";
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory()
          ? walk(path.join(dir, e.name))
          : [path.join(dir, e.name)],
      ),
    )
  ).flat();
}
const source = await walk("src");
const referenced = new Set();
for (const file of source) {
  const text = await readFile(file, "utf8");
  for (const match of text.matchAll(/["'`]\/assets\/([^"'`]+)["'`]/g)) {
    if (!match[1].includes("${")) referenced.add("public/assets/" + match[1]);
  }
}
const files = await walk("public");
for (const file of files)
  if (/photo|private|do-not-publish|\.jpe?g$/i.test(file))
    throw Error("Private-photo guard rejected " + file);
for (const file of referenced) await access(file);
for (const name of ["red", "blue", "yellow"]) {
  await access(`public/assets/vehicles/truck-${name}.png`);
  await access(`public/assets/audio/truck-${name}.wav`);
  await access(`public/assets/audio/truck-try-${name}.wav`);
}
console.log(
  `Verified ${referenced.size} direct asset paths, dynamic truck palettes/audio, and private-photo guard.`,
);
