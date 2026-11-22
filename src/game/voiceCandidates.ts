import { voicePrompts, requiredVoiceIds } from "./voicePrompts";
import { voiceUrl } from "./recordings";
export type Character = "tiggy" | "benny";
type CandidateClip = { id: string; bytes: ArrayBuffer; type: string };
export type Candidate = {
  id: string;
  name: string;
  character: Character;
  provider: string;
  voiceId: string;
  clips: CandidateClip[];
};
const candidates = new Map<string, Candidate>();
const urls = new Map<string, Map<string, string>>();
const active: Partial<Record<Character, string>> = {};
const listeners = new Set<() => void>();
let revision = 0;
let loading: Promise<void> | undefined;
export const subscribeCandidates = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
export const candidateRevision = () => revision;
function notify() {
  revision++;
  listeners.forEach((fn) => fn());
}
export function allCandidates() {
  return [...candidates.values()];
}
export function activeCandidate(character: Character = "tiggy") {
  return active[character];
}
export function candidateUrl(id: string, clip: string) {
  return urls.get(id)?.get(clip);
}
export function resolvedVoiceUrl(clip: string, character: Character = "tiggy") {
  const selected = active[character];
  // An approved character never borrows missing lines from another speaker.
  return selected
    ? candidateUrl(selected, clip)
    : character === "tiggy"
      ? voiceUrl(clip)
      : undefined;
}
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("tiggy-voice-candidates", 1);
    req.onupgradeneeded = () =>
      req.result.createObjectStore("candidates", { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function cache(c: Candidate) {
  urls.get(c.id)?.forEach((url) => URL.revokeObjectURL(url));
  candidates.set(c.id, c);
  urls.set(
    c.id,
    new Map(
      c.clips.map((clip) => [
        clip.id,
        URL.createObjectURL(new Blob([clip.bytes], { type: clip.type })),
      ]),
    ),
  );
}
export function initialiseCandidates() {
  loading ??= (async () => {
    const db = await database();
    try {
      const items = await new Promise<Candidate[]>((resolve, reject) => {
        const req = db
          .transaction("candidates", "readonly")
          .objectStore("candidates")
          .getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      items.forEach(cache);
      for (const character of ["tiggy", "benny"] as const) {
        const id = localStorage.getItem(`tiggy-approved-voice-${character}`);
        if (
          id &&
          candidates.get(id)?.character === character &&
          completeCandidate(candidates.get(id)!)
        )
          active[character] = id;
      }
      notify();
    } finally {
      db.close();
    }
  })().catch(() => {
    /* Import reports unavailable storage; gameplay remains independent. */
  });
  return loading;
}
export function completeCandidate(c: Candidate) {
  return requiredVoiceIds(c.character).every((id) =>
    c.clips.some((clip) => clip.id === id),
  );
}
/** Candidate files contain local audio only; no expiring URLs, keys or network requests. */
export async function importCandidate(file: File) {
  await initialiseCandidates();
  if (file.size > 30_000_000) throw Error("Choose a voice pack under 30 MB.");
  if (candidates.size >= 4)
    throw Error("Delete a candidate before importing another (four maximum).");
  const pack = JSON.parse(await file.text());
  if (
    !pack ||
    pack.format !== "tiggys-character-candidate" ||
    pack.version !== 1 ||
    !["tiggy", "benny"].includes(pack.character) ||
    typeof pack.name !== "string" ||
    !pack.name.trim() ||
    !Array.isArray(pack.clips) ||
    !pack.clips.length ||
    pack.clips.length > voicePrompts.length ||
    typeof pack.provider !== "string" ||
    typeof pack.voiceId !== "string"
  )
    throw Error("Choose a valid Tiggy character candidate pack.");
  const ids = new Set<string>(),
    clips: CandidateClip[] = [];
  let total = 0;
  for (const clip of pack.clips) {
    if (
      !clip ||
      typeof clip.id !== "string" ||
      !voicePrompts.some((p) => p[0] === clip.id) ||
      ids.has(clip.id) ||
      typeof clip.audio !== "string"
    )
      throw Error("The candidate has unknown or duplicate lines.");
    const m = clip.audio.match(
      /^data:(audio\/[a-zA-Z0-9.+-]+(?:;[^,;]+)*);base64,([A-Za-z0-9+/=\s]+)$/,
    );
    if (!m) throw Error("Each candidate line must contain an audio file.");
    const bytes = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
    total += bytes.length;
    if (!bytes.length || bytes.length > 8_000_000 || total > 22_000_000)
      throw Error("Candidate audio is empty or too large.");
    ids.add(clip.id);
    clips.push({ id: clip.id, bytes: bytes.buffer, type: m[1] });
  }
  const c: Candidate = {
    id: crypto.randomUUID(),
    name: pack.name.trim().slice(0, 80),
    character: pack.character,
    provider: pack.provider.slice(0, 100),
    voiceId: pack.voiceId.slice(0, 100),
    clips,
  };
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("candidates", "readwrite");
      tx.objectStore("candidates").put(c);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
  cache(c);
  notify();
  return c.id;
}
export function approveCandidate(id: string) {
  const c = candidates.get(id);
  if (!c || !completeCandidate(c))
    throw Error(
      "Record every library line in this same voice before approving it.",
    );
  localStorage.setItem(`tiggy-approved-voice-${c.character}`, id);
  active[c.character] = id;
  notify();
}
export function restoreOriginalVoice(character: Character) {
  localStorage.removeItem(`tiggy-approved-voice-${character}`);
  delete active[character];
  notify();
}
export async function deleteCandidate(id: string) {
  const c = candidates.get(id);
  if (!c) return;
  if (active[c.character] === id)
    throw Error(
      "Restore the previous voice before deleting an approved candidate.",
    );
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("candidates", "readwrite");
      tx.objectStore("candidates").delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
  urls.get(id)?.forEach((url) => URL.revokeObjectURL(url));
  urls.delete(id);
  candidates.delete(id);
  notify();
}
/** Add standalone MP3/WAV clips without changing any approved voice. Filenames are stable phrase IDs. */
export async function importDialogueFiles(
  id: string | undefined,
  name: string,
  character: Character,
  files: File[],
) {
  await initialiseCandidates();
  if (!name.trim()) throw Error("Give this candidate a name first.");
  if (!files.length) throw Error("Choose MP3 or WAV dialogue files.");
  if (id && active[character] === id)
    throw Error(
      "An approved pack is read-only. Create a new candidate to change it.",
    );
  const previous = id ? candidates.get(id) : undefined;
  if (previous && previous.character !== character)
    throw Error("Choose the same character as this candidate.");
  if (!previous && candidates.size >= 4)
    throw Error("Delete a candidate before importing another (four maximum).");
  const incoming = new Map<string, CandidateClip>();
  for (const file of files) {
    const key = file.name.replace(/\.(mp3|wav)$/i, "");
    if (
      !/\.(mp3|wav)$/i.test(file.name) ||
      !voicePrompts.some((p) => p[0] === key) ||
      incoming.has(key) ||
      !file.size ||
      file.size > 8_000_000
    )
      throw Error(
        "Name each MP3/WAV file after a phrase ID, for example well-done.mp3. No duplicates; maximum 8 MB per file.",
      );
    incoming.set(key, {
      id: key,
      bytes: await file.arrayBuffer(),
      type: /\.mp3$/i.test(file.name) ? "audio/mpeg" : "audio/wav",
    });
  }
  const merged = new Map(previous?.clips.map((c) => [c.id, c]) || []);
  incoming.forEach((c, key) => merged.set(key, c));
  const c: Candidate = {
    id: previous?.id || crypto.randomUUID(),
    name: name.trim().slice(0, 80),
    character,
    provider: previous?.provider || "Prerecorded import",
    voiceId: previous?.voiceId || "Original character performance",
    clips: [...merged.values()],
  };
  if (c.clips.reduce((n, c) => n + c.bytes.byteLength, 0) > 22_000_000)
    throw Error("Keep a complete candidate under 22 MB.");
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("candidates", "readwrite");
      tx.objectStore("candidates").put(c);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
  cache(c);
  notify();
  return c.id;
}
/** Preserve a parent's older partial recordings; vary dialogue once the new lines exist. */
export function celebrationLine(index: number, fallback: string) {
  const ids = ["well-done", "you-did-it", "yay", "good-job", "amazing"];
  const id = ids[index % ids.length];
  return resolvedVoiceUrl(id) ? id : fallback;
}
