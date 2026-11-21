// Technical sprite-sheet packing and responsive encodes, preserving supplied pixels.
// Inputs are generated cartoon exports only. Never pass photographs to this script.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
const [expressions, movement] = process.argv.slice(2);
if (!expressions || !movement)
  throw Error("Pass the expression and movement PNG sheet paths.");
await mkdir("public/assets/tiggy", { recursive: true });
const a = await sharp(expressions).resize(1280, 1280).png().toBuffer();
const b = await sharp(movement).resize(1280, 640).png().toBuffer();
await sharp({
  create: { width: 1280, height: 1920, channels: 4, background: "#00000000" },
})
  .composite([
    { input: a, top: 0, left: 0 },
    { input: b, top: 1280, left: 0 },
  ])
  .png()
  .toFile("public/assets/tiggy/tiggy-actions.png");
