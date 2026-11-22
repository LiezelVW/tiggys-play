"use client";
import { useEffect, useRef, useState } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import { TiggyAnimator } from "../game/TiggyAnimator";
import { unlockAudio, preloadVoice } from "../game/audio";
const resources = [
  "/assets/world/adventure-world-flat.webp",
  "/assets/world/colour-garden-flat.webp",
  "/assets/world/truck-arena-flat.webp",
  "/assets/activities/benny-and-objects-flat.webp",
  "/assets/vehicles/truck-red.png",
  "/assets/vehicles/truck-blue.png",
  "/assets/vehicles/truck-yellow.png",
];
export default function LoadingGate({
  muted,
  onSound,
  onEnter,
}: {
  muted: boolean;
  onSound: () => void;
  onEnter: () => void;
}) {
  const [loading, setLoading] = useState(false),
    [count, setCount] = useState(0),
    [failed, setFailed] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null),
    alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    if (!canvas.current) return;
    const animator = new TiggyAnimator(canvas.current);
    animator.play("Wave");
    let frame = 0,
      last = 0;
    const tick = (t: number) => {
      if (!document.hidden)
        animator.update(last ? Math.min((t - last) / 1000, 0.05) : 0);
      last = t;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      alive.current = false;
      cancelAnimationFrame(frame);
    };
  }, []);
  async function begin() {
    if (loading) return;
    unlockAudio();
    preloadVoice();
    setLoading(true);
    setFailed(false);
    setCount(0);
    const results = await Promise.all(
      resources.map(
        (src) =>
          new Promise<boolean>((resolve) => {
            const image = new Image();
            let done = false;
            const finish = (ok: boolean) => {
              if (done) return;
              done = true;
              clearTimeout(timer);
              if (alive.current) setCount((n) => n + 1);
              resolve(ok);
            };
            const timer = setTimeout(() => finish(false), 12000);
            image.onload = () => {
              if (typeof image.decode === "function")
                void image
                  .decode()
                  .then(() => finish(true))
                  .catch(() => finish(false));
              else finish(true);
            };
            image.onerror = () => finish(false);
            image.src = src;
          }),
      ),
    );
    if (!alive.current) return;
    if (results.every(Boolean)) {
      await Promise.all(
        [...document.images].map((image) =>
          typeof image.decode === "function"
            ? image.decode().catch(() => {})
            : Promise.resolve(),
        ),
      );
      if (alive.current) onEnter();
    } else {
      setLoading(false);
      setFailed(true);
    }
  }
  return (
    <div className="loading-backdrop">
      <section
        className="loading-screen"
        role="dialog"
        aria-modal="true"
        aria-labelledby="loading-title"
      >
        <button
          className="round-button loading-sound"
          onClick={onSound}
          aria-label={muted ? "Turn loading music on" : "Mute loading music"}
        >
          {muted ? <VolumeX /> : <Volume2 />}
        </button>
        <img
          className="loading-logo"
          src="/assets/branding/tiggys-play-logo.svg"
          alt="Tiggy’s Kids"
          width="768"
          height="132"
        />
        <h1 id="loading-title">Play • Learn • Grow</h1>
        <div className="loading-mascot">
          <canvas
            ref={canvas}
            width={400}
            height={540}
            role="img"
            aria-label="Tiggy waving hello"
          />
        </div>
        <p className="loading-caption" aria-live="polite">
          {failed
            ? "Some pictures couldn’t load. Shall we try again?"
            : loading
              ? "Getting our adventure ready…"
              : "A little world of big discoveries"}
        </p>
        {loading && (
          <progress
            aria-label="Adventure loading progress"
            max={resources.length}
            value={count}
          />
        )}
        <button
          autoFocus
          type="button"
          className="primary loading-start"
          disabled={loading}
          onClick={() => void begin()}
        >
          <Play fill="currentColor" />
          {loading
            ? `Loading ${Math.round((count / resources.length) * 100)}%`
            : failed
              ? "Try loading again"
              : "Let’s play"}
        </button>
        <p className="loading-music-note">
          {muted ? "Sound is off" : "A gentle tune starts when you tap play"}
        </p>
      </section>
    </div>
  );
}
