let muted = false;
let current: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let revision = 0;
/** Reuse the user-unlocked media element for Safari's audio policy. */
export function setMuted(value: boolean) {
  muted = value;
  if (value) stopAudio();
}
export function chime(success = true) {
  if (muted) return;
  try {
    ctx ??= new AudioContext();
    void ctx.resume().catch(() => {});
    [0, 0.13, 0.26].forEach((t, i) => {
      const o = ctx!.createOscillator(),
        g = ctx!.createGain();
      o.connect(g);
      g.connect(ctx!.destination);
      o.type = "sine";
      o.frequency.value = (success ? [523, 659, 784] : [330, 294, 262])[i];
      g.gain.setValueAtTime(0.06, ctx!.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ctx!.currentTime + t + 0.25);
      o.start(ctx!.currentTime + t);
      o.stop(ctx!.currentTime + t + 0.26);
      o.onended = () => {
        o.disconnect();
        g.disconnect();
      };
    });
  } catch {
    /* Captions and visuals always remain available. */
  }
}
export function speak(text: string, clip?: string) {
  if (muted) return;
  stopAudio();
  const request = revision;
  let usedFallback = false;
  const fallback = () => {
    if (usedFallback || muted || request !== revision) return;
    usedFallback = true;
    try {
      if ("speechSynthesis" in window) {
        const s = new SpeechSynthesisUtterance(text);
        s.rate = 0.82;
        s.pitch = 1.1;
        s.lang = "en-GB";
        speechSynthesis.speak(s);
      }
    } catch {
      /* Speech is optional. */
    }
  };
  if (clip) {
    current ??= new Audio();
    current.src = `/assets/audio/${clip}.wav`;
    current.onerror = fallback;
    void current.play().catch(fallback);
  } else fallback();
}
export function stopAudio() {
  revision++;
  current?.pause();
  if (current) current.onerror = null;
  if ("speechSynthesis" in window) speechSynthesis.cancel();
}
