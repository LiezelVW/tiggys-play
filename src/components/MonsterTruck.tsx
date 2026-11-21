"use client";
import { useEffect, useRef, useState } from "react";
import {
  Home,
  Volume2,
  RotateCcw,
  ArrowUp,
  CircleDot,
  Flag,
} from "lucide-react";
import type { TruckScene, TruckStatus } from "../game/TruckScene";
import { colours } from "../game/rules";
import { useVoiceAvailable } from "./useVoice";
import { speak, chime, stopAudio } from "../game/audio";
import { useDialogFocus } from "./useDialogFocus";
export default function MonsterTruck({
  onHome,
  onComplete,
  suspended,
}: {
  onHome: () => void;
  onComplete: () => void;
  suspended: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<TruckScene | null>(null);
  const runtime = useRef<import("phaser").Game | null>(null);
  const callbacks = useRef({ onComplete, suspended });
  callbacks.current = { onComplete, suspended };
  const [status, setStatus] = useState<TruckStatus>({
    phase: "choose",
    round: 1,
    completed: 0,
    distance: 0,
    target: "red",
  });
  const [caption, setCaption] = useState("Find the red truck!");
  const [clip, setClip] = useState("truck-red");
  const hasNarration = useVoiceAvailable(clip);
  const [loaded, setLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [portrait, setPortrait] = useState(false);
  const [error, setError] = useState(false);
  const [replay, setReplay] = useState(0);
  const finished = status.completed === 3;
  useDialogFocus(finished);
  useEffect(() => {
    let disposed = false;
    setReducedMotion(matchMedia("(prefers-reduced-motion: reduce)").matches);
    const resize = new ResizeObserver(() => runtime.current?.scale.refresh());
    if (host.current) resize.observe(host.current);
    Promise.all([import("phaser"), import("../game/TruckScene")])
      .then(([Phaser, { TruckScene }]) => {
        if (disposed || !host.current) return;
        const level = new TruckScene(
          (s) => {
            setStatus(s);
            setLoaded(true);
            if (s.completed === 3) callbacks.current.onComplete();
          },
          (text, id) => {
            setCaption(text);
            setClip(id);
            speak(text, id);
          },
          () => chime(),
        );
        scene.current = level;
        const phone = window.innerWidth <= 600;
        setPortrait(phone);
        runtime.current = new Phaser.Game({
          type: Phaser.CANVAS,
          parent: host.current,
          width: phone ? 600 : 1000,
          height: phone ? 650 : 600,
          scene: level,
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
          render: { antialias: true },
          audio: { noAudio: true },
        });
      })
      .catch(() => setError(true));
    return () => {
      disposed = true;
      resize.disconnect();
      runtime.current?.destroy(true);
      runtime.current = null;
      scene.current = null;
      stopAudio();
    };
  }, [replay]);
  useEffect(() => {
    if (!loaded) return;
    if (suspended) {
      runtime.current?.scene.pause("trucks");
      stopAudio();
    } else runtime.current?.scene.resume("trucks");
  }, [loaded, suspended]);
  return (
    <main className="game-page truck-page">
      <div className="game-top">
        <button className="pill" onClick={onHome}>
          <Home /> My world
        </button>
        <h1>Monster Truck Mayhem</h1>
        <button
          className="round-button"
          aria-label={
            hasNarration
              ? "Replay instruction"
              : "Spoken instructions awaiting voice approval"
          }
          disabled={!hasNarration}
          onClick={() => speak(caption, clip)}
        >
          <Volume2 />
        </button>
      </div>
      <div className="instruction" aria-live="polite">
        <Volume2 />
        <span>{caption}</span>
        <strong>{Math.min(status.round, 3)} / 3</strong>
      </div>
      <div
        className={`game-canvas ${portrait ? "portrait-canvas" : ""}`}
        data-layout={portrait ? "portrait" : "landscape"}
        ref={host}
        data-ready={loaded}
        aria-label="Monster truck arena. Choose the requested colour, then tap to drive over the ramp."
      />
      {!loaded && !error && <p role="status">Warming up the engines…</p>}
      {error && (
        <p role="alert">
          The trucks couldn’t load. Please return home and try again.
        </p>
      )}
      <div className="truck-controls">
        {status.phase === "choose" ? (
          <>
            <span
              className="target-dot"
              style={{
                background: colours.find((c) => c.name === status.target)!.css,
              }}
              aria-label={`Find ${status.target}`}
            />
            {colours.map((c) => (
              <button
                className="colour-choice"
                key={c.name}
                disabled={!loaded || suspended}
                aria-label={`Choose ${c.name} truck`}
                onClick={() => scene.current?.choose(c.name)}
                style={{ "--swatch": c.css } as React.CSSProperties}
              >
                <span />
                <small>{c.label}</small>
              </button>
            ))}
          </>
        ) : (
          <>
            <button
              className="drive-button"
              disabled={status.phase !== "drive" || suspended}
              onClick={() => scene.current?.drive()}
            >
              <CircleDot size={37} />
              <span>GO!</span>
            </button>
            <button
              className="jump-button"
              disabled={status.phase !== "drive" || suspended || reducedMotion}
              onClick={() => scene.current?.jump()}
            >
              <ArrowUp />
              <span>Jump</span>
            </button>
            <progress
              max={1}
              value={status.distance}
              aria-label="Distance to finish"
            />
            <Flag />
          </>
        )}
      </div>
      {finished && (
        <div className="modal-backdrop">
          <section
            className="modal celebration"
            role="dialog"
            aria-modal="true"
            aria-labelledby="truck-done"
          >
            <Flag size={52} />
            <h2 id="truck-done">What a colourful adventure!</h2>
            <p>You drove red, blue and yellow trucks over the ramp.</p>
            <button
              className="primary"
              onClick={() => {
                setLoaded(false);
                setStatus((s) => ({
                  ...s,
                  completed: 0,
                  round: 1,
                  phase: "choose",
                }));
                setReplay((r) => r + 1);
              }}
            >
              <RotateCcw /> Play again
            </button>
            <button className="pill" onClick={onHome}>
              <Home /> Back to my world
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
