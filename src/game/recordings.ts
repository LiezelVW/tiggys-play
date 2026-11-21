import { voicePrompts } from "./voicePrompts";
type SavedClip = { id: string; blob: Blob };
type StoredClip = {
  id: string;
  bytes?: ArrayBuffer;
  type?: string;
  blob?: Blob;
};
async function stored(clip: SavedClip) {
  return {
    id: clip.id,
    bytes: await clip.blob.arrayBuffer(),
    type: clip.blob.type,
  };
}
const clips = new Map<string, { blob: Blob; url: string }>();
const subscribers = new Set<() => void>();
let loading: Promise<void> | undefined;
let revision = 0;
export function voiceRevision() {
  return revision;
}
function notify() {
  revision++;
  subscribers.forEach((fn) => fn());
}
export function subscribeVoice(fn: () => void) {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}
export function voiceCount() {
  return clips.size;
}
export function voiceAvailable(id: string) {
  return clips.has(id);
}
export function voiceUrl(id: string) {
  return clips.get(id)?.url;
}
export function voiceBlob(id: string) {
  return clips.get(id)?.blob;
}
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("tiggy-parent-voice", 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains("clips"))
        req.result.createObjectStore("clips", { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function records() {
  const db = await database();
  try {
    return await new Promise<StoredClip[]>((resolve, reject) => {
      const req = db
        .transaction("clips", "readonly")
        .objectStore("clips")
        .getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}
function cache(id: string, blob: Blob) {
  const old = clips.get(id);
  if (old) URL.revokeObjectURL(old.url);
  clips.set(id, { blob, url: URL.createObjectURL(blob) });
}
export function initialiseVoiceClips() {
  loading ??= records()
    .then((items) => {
      for (const item of items) {
        const blob = item.bytes
          ? new Blob([item.bytes], { type: item.type })
          : item.blob;
        if (voicePrompts.some((p) => p[0] === item.id) && blob instanceof Blob)
          cache(item.id, blob);
      }
      notify();
    })
    .catch(() => {
      /* Recording UI reports storage errors when saving; visual play always works. */
    });
  return loading;
}
export async function saveVoice(id: string, blob: Blob) {
  if (
    !voicePrompts.some((p) => p[0] === id) ||
    blob.size === 0 ||
    blob.size > 8_000_000 ||
    !blob.type.startsWith("audio/")
  )
    throw Error("Choose a short audio recording.");
  const entry = await stored({ id, blob });
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("clips", "readwrite");
      tx.objectStore("clips").put(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    cache(id, blob);
    notify();
  } finally {
    db.close();
  }
}
export async function deleteVoice(id?: string) {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("clips", "readwrite"),
        store = tx.objectStore("clips");
      if (id) store.delete(id);
      else store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    if (id) {
      const old = clips.get(id);
      if (old) URL.revokeObjectURL(old.url);
      clips.delete(id);
    } else {
      clips.forEach((v) => URL.revokeObjectURL(v.url));
      clips.clear();
    }
    notify();
  } finally {
    db.close();
  }
}
export async function exportVoicePack() {
  const items = await records();
  const encoded = await Promise.all(
    items.map(async (c) => ({
      id: c.id,
      audio: await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(
          c.bytes ? new Blob([c.bytes], { type: c.type }) : c.blob!,
        );
      }),
    })),
  );
  return new Blob(
    [
      JSON.stringify({
        format: "tiggys-parent-voice",
        version: 1,
        clips: encoded,
      }),
    ],
    { type: "application/json" },
  );
}
/** Restore an explicitly selected local pack; validate completely before writing anything. */
export async function restoreVoicePack(file: File) {
  if (file.size > 30_000_000)
    throw Error("Choose a voice pack smaller than 30 MB.");
  const pack = JSON.parse(await file.text()) as {
    format?: string;
    version?: number;
    clips?: unknown[];
  };
  if (
    !pack ||
    typeof pack !== "object" ||
    pack.format !== "tiggys-parent-voice" ||
    pack.version !== 1 ||
    !Array.isArray(pack.clips) ||
    pack.clips.length > voicePrompts.length
  )
    throw Error("This is not a Tiggy’s Play voice pack.");
  const parsed: SavedClip[] = [],
    ids = new Set<string>();
  for (const item of pack.clips) {
    if (!item || typeof item !== "object")
      throw Error("The voice pack contains an invalid recording.");
    const entry = item as { id?: unknown; audio?: unknown };
    if (
      typeof entry.id !== "string" ||
      !voicePrompts.some((p) => p[0] === entry.id) ||
      ids.has(entry.id) ||
      typeof entry.audio !== "string"
    )
      throw Error("The voice pack contains an unknown or duplicate line.");
    const match = entry.audio.match(
      /^data:(audio\/[a-zA-Z0-9.+-]+(?:;[^,;]+)*);base64,([A-Za-z0-9+/=\s]+)$/,
    );
    if (!match) throw Error("The voice pack contains an invalid audio file.");
    const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
    if (bytes.length === 0 || bytes.length > 8_000_000)
      throw Error("A voice recording is empty or too large.");
    ids.add(entry.id);
    parsed.push({ id: entry.id, blob: new Blob([bytes], { type: match[1] }) });
  }
  const entries = await Promise.all(parsed.map(stored));
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("clips", "readwrite"),
        store = tx.objectStore("clips");
      entries.forEach((c) => store.put(c));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    parsed.forEach((c) => cache(c.id, c.blob));
    notify();
  } finally {
    db.close();
  }
}
