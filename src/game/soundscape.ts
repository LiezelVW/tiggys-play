/** Original procedural instrumental music and gentle foley. No downloads, provider keys or tracking. */
let context: AudioContext | undefined,
  music: GainNode | undefined,
  effects: GainNode | undefined;
let voice: GainNode | undefined;
let voiceVolume = 0.7;
const voiceSources = new WeakMap<
  HTMLMediaElement,
  MediaElementAudioSourceNode
>();
let musicVolume = 0.18,
  effectsVolume = 0.45,
  muted = false,
  paused = false,
  ducked = false,
  track = "world",
  index = 0,
  next = 0;
let timer: ReturnType<typeof setInterval> | undefined;
const nodes = new Set<AudioScheduledSourceNode>();
const motifs: Record<string, number[]> = {
  world: [0, 4, 7, 9, 7, 4, 2, 4],
  builders: [0, 7, 4, 7, 2, 5, 2, 0],
  science: [0, 2, 7, 4, 9, 7, 4, 2],
  blocks: [0, 4, 0, 7, 2, 5, 2, 9],
  ready: [0, 2, 4, 0, 7, 4, 2, 0],
  garden: [0, 2, 4, 7, 4, 2, 0, -3],
  trucks: [0, 0, 7, 4, 2, 4, 7, 9],
  railway: [0, 4, 7, 4, 2, 5, 9, 5],
  ferris: [0, 7, 9, 7, 4, 2, 4, 7],
  breakfast: [0, 4, 2, 0, 4, 7, 4, 2],
  potty: [0, 2, 4, 2, 0, -3, 0, 2],
};
function gain() {
  if (!context || !music || !effects) return;
  voice?.gain.setTargetAtTime(
    muted ? 0 : voiceVolume,
    context.currentTime,
    0.025,
  );
  music.gain.setTargetAtTime(
    muted || paused ? 0 : musicVolume * (ducked ? 0.25 : 1),
    context.currentTime,
    0.15,
  );
  effects.gain.setTargetAtTime(
    muted || paused ? 0 : effectsVolume,
    context.currentTime,
    0.025,
  );
}
function keep(node: AudioScheduledSourceNode) {
  nodes.add(node);
  node.onended = () => {
    nodes.delete(node);
    node.disconnect();
  };
}
function note(
  frequency: number,
  start: number,
  length: number,
  level: number,
  target: GainNode,
  type: OscillatorType = "sine",
) {
  if (!context) return;
  const o = context.createOscillator(),
    g = context.createGain();
  o.type = type;
  o.frequency.value = frequency;
  o.connect(g);
  g.connect(target);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(level, start + 0.025);
  g.gain.exponentialRampToValueAtTime(0.0001, start + length);
  o.start(start);
  o.stop(start + length + 0.03);
  keep(o);
  o.addEventListener("ended", () => g.disconnect());
}
function schedule() {
  if (!context || context.state !== "running" || paused || muted || !music)
    return;
  if (next < context.currentTime) next = context.currentTime + 0.05;
  while (next < context.currentTime + 0.25) {
    const motif = motifs[track] || motifs.world,
      shift = Object.keys(motifs).includes(track) ? 0 : 2;
    const frequency =
      261.6256 * Math.pow(2, (motif[index % motif.length] + shift) / 12);
    note(frequency, next, 0.65, 0.12, music);
    note(frequency * 2, next, 0.35, 0.025, music);
    if (index % 4 === 0)
      note(
        130.8128 * Math.pow(2, (index % 8 === 0 ? 0 : 5) / 12),
        next,
        1.8,
        0.07,
        music,
        "triangle",
      );
    index++;
    next += 0.52;
  }
}
export function unlockAmbience() {
  try {
    if (!context) {
      context = new AudioContext();
      music = context.createGain();
      effects = context.createGain();
      voice = context.createGain();
      voice.gain.value = voiceVolume;
      voice.connect(context.destination);
      music.gain.value = 0;
      effects.gain.value = effectsVolume;
      music.connect(context.destination);
      effects.connect(context.destination);
    }
    void context
      .resume()
      .then(schedule)
      .catch(() => {});
    gain();
    timer ??= setInterval(schedule, 100);
  } catch {}
}
export function setMusicTrack(value: string) {
  if (track === value) return;
  track = value;
  index = 0;
  if (context) next = context.currentTime + 0.1;
}
/** One reusable voice element routed through a real gain stage, including iOS Safari. */
export function connectVoice(audio: HTMLMediaElement) {
  if (!context || !voice) return false;
  if (voiceSources.has(audio)) return true;
  try {
    const source = context.createMediaElementSource(audio);
    source.connect(voice);
    voiceSources.set(audio, source);
    return true;
  } catch {
    return false;
  }
}
export function setVoiceMixVolume(value: number) {
  voiceVolume = Math.max(0, Math.min(1, value));
  gain();
}
export function setMusicVolume(value: number) {
  musicVolume = Math.max(0, Math.min(1, value));
  gain();
}
export function setEffectsVolume(value: number) {
  effectsVolume = Math.max(0, Math.min(1, value));
  gain();
}
export function setSoundscapeMuted(value: boolean) {
  muted = value;
  gain();
}
export function duckMusic(value: boolean) {
  ducked = value;
  gain();
}
export function pauseSoundscape(value: boolean) {
  paused = value;
  gain();
  if (value) {
    for (const n of nodes) {
      try {
        n.stop();
      } catch {}
    }
    nodes.clear();
  } else if (context) {
    next = context.currentTime + 0.05;
    schedule();
  }
}
export function gentleEffect(
  kind: "success" | "clap" | "whistle" | "connect" | "spoon" | "water" | "wipe",
) {
  if (muted || paused || effectsVolume === 0) return;
  unlockAmbience();
  if (!context || !effects) return;
  const now = context.currentTime;
  if (kind === "success") {
    [523.25, 659.25, 783.99].forEach((f, i) =>
      note(f, now + i * 0.13, 0.3, 0.11, effects!),
    );
    return;
  }
  if (kind === "whistle") {
    note(659.25, now, 0.55, 0.055, effects);
    note(783.99, now + 0.15, 0.5, 0.04, effects);
    return;
  }
  if (kind === "spoon" || kind === "connect") {
    note(kind === "spoon" ? 880 : 330, now, 0.12, 0.065, effects, "triangle");
    return;
  }
  const bursts = kind === "clap" ? 3 : 1;
  for (let i = 0; i < bursts; i++) {
    const duration = kind === "water" ? 0.65 : kind === "wipe" ? 0.4 : 0.09,
      buffer = context.createBuffer(
        1,
        Math.floor(context.sampleRate * duration),
        context.sampleRate,
      ),
      data = buffer.getChannelData(0);
    for (let j = 0; j < data.length; j++)
      data[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / data.length, 2);
    const n = context.createBufferSource(),
      filter = context.createBiquadFilter(),
      g = context.createGain();
    n.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.value = kind === "clap" ? 1800 : 900;
    g.gain.value = kind === "clap" ? 0.13 : 0.07;
    n.connect(filter);
    filter.connect(g);
    g.connect(effects);
    n.start(now + i * 0.22);
    keep(n);
    n.addEventListener("ended", () => {
      filter.disconnect();
      g.disconnect();
    });
  }
}
