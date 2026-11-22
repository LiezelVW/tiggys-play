import { copyFile, mkdir } from "node:fs/promises";
await mkdir("public/assets/runtime", { recursive: true });
await copyFile("node_modules/@rive-app/canvas/rive.wasm", "public/assets/runtime/rive.wasm");
console.log("Prepared self-hosted Rive WASM from the pinned runtime; no external CDN required.");
