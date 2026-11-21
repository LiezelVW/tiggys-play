// Palette swaps affect red paint only; glass, outline and trim remain unchanged.
import sharp from "sharp";
const { data, info } = await sharp("public/assets/vehicles/truck-red.png")
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
for (const [name, paint] of [
  ["blue", [0.16, 0.6, 0.92]],
  ["yellow", [1, 0.78, 0.13]],
]) {
  const pixels = Buffer.from(data);
  for (let i = 0; i < pixels.length; i += 4) {
    const [r, g, b] = [pixels[i], pixels[i + 1], pixels[i + 2]];
    if (r > g * 1.2 && r > b * 1.2 && r > 45) {
      const white = Math.min(g, b) / r;
      for (let c = 0; c < 3; c++)
        pixels[i + c] = Math.round(r * (paint[c] * (1 - white) + white));
    }
  }
  await sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(`public/assets/vehicles/truck-${name}.png`);
}
