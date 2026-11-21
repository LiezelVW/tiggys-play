let muted = false;
let current: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
export function setMuted(value: boolean) {
  muted = value;
  if (value) {
    current?.pause();
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }
}
export function chime(success = true) {
  if (muted) return;
  try {
    ctx ??= new AudioContext();
    void ctx.resume();
    [0, 0.13, 0.26].forEach((t, i) => {
      const o = ctx!.createOscillator(),
        g = ctx!.createGain();
      o.connect(g);
      g.connect(ctx!.destination);
      o.type = "sine";
      o.frequency.value = (success ? [523, 659, 784] : [330, 294, 262])[i];
      g.gain.setValueAtTime(0.08, ctx!.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ctx!.currentTime + t + 0.25);
      o.start(ctx!.currentTime + t);
      o.stop(ctx!.currentTime + t + 0.26);
    });
  } catch {
    /* Audio is optional. */
  }
}
export function speak(text: string, clip?: string) {
  if (muted) return;
  current?.pause();
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  const fallback = () => {
    try {
      if ("speechSynthesis" in window) {
        const s = new SpeechSynthesisUtterance(text);
        s.rate = 0.82;
        s.pitch = 1.12;
        s.lang = "en-GB";
        speechSynthesis.speak(s);
      }
    } catch {
      /* Captions remain available. */
    }
  };
  if (clip) {
    current = new Audio(`/assets/audio/${clip}.wav`);
    current.onerror = fallback;
    void current.play().catch(fallback);
  } else fallback();
}
export function stopAudio() {
  current?.pause();
  if ("speechSynthesis" in window) speechSynthesis.cancel();
}
