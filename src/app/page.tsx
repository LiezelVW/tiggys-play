"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  Volume2,
  VolumeX,
  ShieldCheck,
  Flower2,
  BookOpen,
  Shapes,
  Music2,
  Blocks,
  Heart,
  Sun,
  Leaf,
  Play,
  Home,
  X,
  Check,
} from "lucide-react";
import { useDialogFocus } from "../components/useDialogFocus";
import Thiago from "../components/Thiago";
import Garden from "../components/Garden";
import { setMuted, speak } from "../game/audio";
type Progress = { completed: number; minutes: number };
export default function Page() {
  const [ready, setReady] = useState(false);
  const [game, setGame] = useState(false);
  const [muted, updateMuted] = useState(false);
  const [parent, setParent] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [answer, setAnswer] = useState("");
  const [wrong, setWrong] = useState(false);
  const [progress, setProgress] = useState<Progress>({
    completed: 0,
    minutes: 0,
  });
  const [limit, setLimit] = useState(15);
  const [session, setSession] = useState(0);
  const [paused, setPaused] = useState(false);
  const [notice, setNotice] = useState("");
  useDialogFocus(parent || !!notice || paused);
  useEffect(() => {
    setReady(true);
    try {
      const p = localStorage.getItem("tiggy-progress");
      if (p) {
        const saved = JSON.parse(p);
        if (Number.isSafeInteger(saved.completed) && saved.completed >= 0)
          setProgress({ completed: saved.completed, minutes: 0 });
      }
      const m = localStorage.getItem("tiggy-muted") === "true";
      updateMuted(m);
      setMuted(m);
      const l = Number(localStorage.getItem("tiggy-limit"));
      if ([10, 15, 20, 30].includes(l)) setLimit(l);
    } catch {
      /* Storage unavailable: session-only play. */
    }
  }, []);
  useEffect(() => {
    if (!game || paused) return;
    const t = setInterval(() => {
      setSession((s) => {
        if (s + 1 >= limit * 60) setPaused(true);
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [game, paused, limit]);
  function sound() {
    const m = !muted;
    updateMuted(m);
    setMuted(m);
    try {
      localStorage.setItem("tiggy-muted", String(m));
    } catch {}
  }
  function completed() {
    setProgress((p) => {
      const value = {
        completed: p.completed + 1,
        minutes: Math.ceil(session / 60),
      };
      try {
        localStorage.setItem("tiggy-progress", JSON.stringify(value));
      } catch {}
      return value;
    });
  }
  function start() {
    setGame(true);
    speak("Let’s match the flowers to their colour baskets.", "intro");
  }
  return (
    <>
      <header>
        <button
          className="brand"
          onClick={() => setGame(false)}
          aria-label="Tiggy’s Play home"
        >
          <span>
            TIGGY’S
            <span className="brand-play">
              Play<span className="brand-spark">✦</span>
            </span>
          </span>
          <small>PLAY · LEARN · GROW</small>
        </button>
        <nav>
          <span className="nav-current">
            <Home size={17} /> My little world
          </span>
          <button
            className="icon-button"
            onClick={sound}
            aria-label={muted ? "Turn sound on" : "Mute sound"}
          >
            {muted ? <VolumeX size={21} /> : <Volume2 size={21} />}
          </button>
          <button
            className="parent-button"
            disabled={!ready}
            onClick={() => {
              setParent(true);
              setUnlocked(false);
              setAnswer("");
              setWrong(false);
            }}
          >
            <ShieldCheck size={17} /> Grown-ups
          </button>
        </nav>
      </header>
      {game ? (
        <Garden onHome={() => setGame(false)} onComplete={completed} />
      ) : (
        <main className="adventure-home">
          <section className="adventure-stage" aria-label="Tiggy's Play adventure world">
            <div className="adventure-picture" role="img" aria-label="Tiggy waves beside a monster truck, with six colourful game worlds, trains and construction vehicles." />
            <div className="adventure-controls">
              <button className="adventure-hit monster" onClick={() => setNotice("Monster Truck Mayhem is being built. Try Colour Garden while we get the trucks ready!")} aria-label="Monster Truck Mayhem — coming soon" />
              <button className="adventure-hit builders" onClick={() => setNotice("Little Builders is being built. Try Colour Garden while we get the diggers ready!")} aria-label="Little Builders — coming soon" />
              <button className="adventure-hit railway" onClick={() => setNotice("Tiggy's Railway is being built. Try Colour Garden while we lay the tracks!")} aria-label="Tiggy's Railway — coming soon" />
              <button className="adventure-hit science" onClick={() => setNotice("Science Lab is being built. Try Colour Garden while we prepare the experiments!")} aria-label="Science Lab — coming soon" />
              <button className="adventure-hit blocks" onClick={() => setNotice("Build and Solve is being built. Try Colour Garden while we prepare the puzzles!")} aria-label="Build and Solve — coming soon" />
              <button className="adventure-hit racing" onClick={() => setNotice("Ready, Set, Go! is being built. Try Colour Garden while we prepare the race!")} aria-label="Ready, Set, Go! — coming soon" />
            </div>
          </section>
          <div className="adventure-playbar">
            <button className="adventure-play" disabled={!ready} onClick={start}><Play size={25} fill="currentColor" /> Play Colour Garden <span>AVAILABLE NOW</span></button>
            <button className="adventure-hello" onClick={() => speak("Hello! I'm Tiggy! Let's play!", "welcome")}><Volume2 size={24}/> Say hello to Tiggy</button>
          </div>
        </main>
      )}
      <footer>
        <span>© {new Date().getFullYear()} Tiggy’s Play</span>
        <span>Made with love, inspired by Thiago.</span>
        <button
          onClick={() => {
            setNotice(
              "This foundation stores only completed Colour Garden sessions, sound preferences and a time limit on this device. No account, microphone, advertising or analytics. Delete local progress in Grown-ups.",
            );
          }}
        >
          Privacy & care
        </button>
      </footer>
      {notice && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notice-title"
          >
            <button
              autoFocus
              className="modal-close"
              aria-label="Close"
              onClick={() => setNotice("")}
            >
              <X />
            </button>
            <h2 id="notice-title">Privacy & care</h2>
            <p>{notice}</p>
          </section>
        </div>
      )}
      {parent && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="parent-title"
          >
            <button
              className="modal-close"
              aria-label="Close grown-ups"
              onClick={() => setParent(false)}
            >
              <X />
            </button>
            <ShieldCheck size={34} />
            <h2 id="parent-title">A moment for grown-ups.</h2>
            {!unlocked ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (answer === "42") {
                    setUnlocked(true);
                    setWrong(false);
                  } else setWrong(true);
                }}
              >
                <p>To open the parent area, what is six multiplied by seven?</p>
                <label>
                  Your answer
                  <input
                    autoFocus
                    inputMode="numeric"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                </label>
                {wrong && <p role="alert">Please try again.</p>}
                <button className="primary">Open parent area</button>
              </form>
            ) : (
              <>
                <p>
                  Device-only progress. Parent accounts and child profiles are
                  planned for Phase 5.
                </p>
                <div className="stats">
                  <strong>
                    {progress.completed}
                    <small>Gardens completed</small>
                  </strong>
                  <strong>
                    <Check />
                    <small>Colours & matching</small>
                  </strong>
                </div>
                <label>
                  Play session limit
                  <select
                    value={limit}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setLimit(v);
                      try {
                        localStorage.setItem("tiggy-limit", String(v));
                      } catch {}
                    }}
                  >
                    {[10, 15, 20, 30].map((n) => (
                      <option key={n} value={n}>
                        {n} minutes
                      </option>
                    ))}
                  </select>
                </label>
                <button className="pill" onClick={sound}>
                  {muted ? <VolumeX size={18} /> : <Volume2 size={18} />} Sound{" "}
                  {muted ? "off" : "on"}
                </button>
                <p className="small-print">
                  Microphone is not used. Recommendation: Colour Garden, with
                  tap-to-place controls for younger players.
                </p>
                <button
                  className="text-button"
                  onClick={() => {
                    try {
                      localStorage.removeItem("tiggy-progress");
                    } catch {}
                    setProgress({ completed: 0, minutes: 0 });
                  }}
                >
                  Delete learning progress on this device
                </button>
                {paused && (
                  <button
                    className="primary"
                    onClick={() => {
                      setSession(0);
                      setPaused(false);
                      setParent(false);
                    }}
                  >
                    Start a new play session
                  </button>
                )}
              </>
            )}
          </section>
        </div>
      )}
      {paused && !parent && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="break-title"
          >
            <Sun size={48} />
            <h2 id="break-title">Time for a little break.</h2>
            <p>Let’s stretch, have a drink and explore the world around us.</p>
            <button
              autoFocus
              className="primary"
              onClick={() => {
                setGame(false);
                setParent(true);
                setUnlocked(false);
                setAnswer("");
              }}
            >
              Find a grown-up
            </button>
          </section>
        </div>
      )}
    </>
  );
}
