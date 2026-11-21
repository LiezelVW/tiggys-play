"use client";
import { useEffect, useRef, useState } from "react";
import { Volume2, RotateCcw, Home, Flower2 } from "lucide-react";
import { useVoiceAvailable } from "./useVoice";
import { speak, chime, stopAudio } from "../game/audio";
import { useDialogFocus } from "./useDialogFocus";
import { colours, type Colour } from "../game/rules";
export default function Garden({
  onHome,
  onComplete,
  suspended,
}: {
  onHome: () => void;
  onComplete: () => void;
  suspended: boolean;
}) {
  const runtime = useRef<import("phaser").Game | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<{ accessibleMatch: (c: Colour) => void } | null>(null);
  const [score, setScore] = useState(0);
  const [portrait, setPortrait] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [round, setRound] = useState(1);
  const [finished, setFinished] = useState(false);
  const [clip, setClip] = useState("intro");
  const hasNarration = useVoiceAvailable(clip);
  const [caption, setCaption] = useState(
    "Let’s match the flowers to their colour baskets.",
  );
  const [replay, setReplay] = useState(0);
  const [error, setError] = useState(false);
  const done = useRef(onComplete);
  done.current = onComplete;
  useDialogFocus(finished);
  useEffect(() => {
    let disposed = false;
    const resize = new ResizeObserver(() => runtime.current?.scale.refresh());
    if (host.current) resize.observe(host.current);

    Promise.all([import("phaser"), import("../game/GardenScene")])
      .then(([Phaser, { GardenScene }]) => {
        if (disposed || !host.current) return;
        const level = new GardenScene(
          (n, r, end) => {
            setLoaded(true);
            setScore(n);
            setRound(r);
            setFinished(end);
            if (end) done.current();
          },
          (text, clip) => {
            setCaption(text);
            setClip(clip);
            speak(text, clip);
          },
          chime,
        );
        scene.current = level;
        const phone = window.innerWidth <= 600;
        setPortrait(phone);
        runtime.current = new Phaser.Game({
          type: Phaser.CANVAS,
          parent: host.current,
          width: phone ? 600 : 1000,
          height: phone ? 650 : 600,
          backgroundColor: "#e9f3e7",
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
      scene.current = null;
      runtime.current?.destroy(true);
      runtime.current = null;
      stopAudio();
    };
  }, [replay]);
  useEffect(() => {
    if (!loaded) return;
    if (suspended) {
      runtime.current?.scene.pause("garden");
      stopAudio();
    } else runtime.current?.scene.resume("garden");
  }, [loaded, suspended]);
  return (
    <main className="game-page">
      <div className="game-top">
        <button className="pill" onClick={onHome}>
          <Home size={20} /> My world
        </button>
        <span className="eyebrow">COLOUR GARDEN</span>
        <button
          className="icon-button"
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
      <div className="game-heading">
        <div>
          <span className="eyebrow">LET’S GROW SOMETHING LOVELY</span>
          <h1>A garden full of colour.</h1>
        </div>
        <div className="round">
          Round {round} of 3 <span>{score} / 9 flowers</span>
        </div>
      </div>
      <div className="instruction" aria-live="polite">
        <Volume2 size={22} />
        {caption}
      </div>
      <div
        className={`game-canvas ${portrait ? "portrait-canvas" : ""}`}
        data-layout={portrait ? "portrait" : "landscape"}
        data-ready={loaded}
        ref={host}
        aria-label="Drag a flower to its matching colour basket, or tap a flower then a basket."
      />
      {error && (
        <p role="alert">
          The garden could not load. Please refresh and try again.
        </p>
      )}
      <div className="game-bottom">
        <p>Drag a flower, or tap a flower and its basket.</p>
        <progress value={score} max={9} aria-label="Flowers matched" />
      </div>
      <details className="accessible">
        <summary>Use keyboard or simple matching controls</summary>
        <p>Choose a colour to help Thiago match its flower.</p>
        {colours.map((c) => (
          <button
            className="pill"
            key={c.name}
            onClick={() => scene.current?.accessibleMatch(c.name)}
          >
            Match {c.label.toLowerCase()}
          </button>
        ))}
      </details>
      {finished && (
        <div className="modal-backdrop">
          <section
            className="modal celebration"
            role="dialog"
            aria-modal="true"
            aria-labelledby="done-title"
          >
            <Flower2 size={60} />
            <span className="eyebrow">A LITTLE MOMENT TO BE PROUD OF</span>
            <h2 id="done-title">You helped the garden grow!</h2>
            <p>Nine colourful flowers, all matched with care.</p>
            <button
              autoFocus
              className="primary"
              onClick={() => {
                setLoaded(false);
                setScore(0);
                setFinished(false);
                setReplay((x) => x + 1);
              }}
            >
              {" "}
              <RotateCcw size={20} /> Play again
            </button>
            <button className="pill" onClick={onHome}>
              <Home size={20} /> Back to my world
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
