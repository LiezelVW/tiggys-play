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
        <main className="home-page">
          <section className="hero">
            <div className="hero-copy">
              <div className="welcome">
                <span /> LITTLE ADVENTURES. BIG DISCOVERIES.
              </div>
              <h1>
                A little world.
                <br />A whole lot of <em>wonder.</em>
              </h1>
              <p>
                Come play with Thiago! Discover colours,
                <br className="desktop-break" /> find new words and grow a
                little every day.
              </p>
              <button className="primary" disabled={!ready} onClick={start}>
                <Play size={19} fill="currentColor" /> Let’s play together
              </button>
              <div className="hero-note">
                <Heart size={15} /> Made for little minds, ages 2–6
              </div>
            </div>
            <div className="hero-art">
              <div className="sun">
                <Sun size={68} strokeWidth={1.4} />
              </div>
              <span className="cloud cloud-one" />
              <span className="cloud cloud-two" />
              <div className="hill hill-back" />
              <div className="hill hill-front" />
              <div className="hero-flower flower-one">✿</div>
              <div className="hero-flower flower-two">✿</div>
              <div className="hero-flower flower-three">✿</div>
              <button
                className="hello-bubble"
                onClick={() =>
                  speak("Hello! I’m Thiago. Let’s play together!", "welcome")
                }
              >
                Hi, I’m Thiago! <span>Let’s explore.</span>
                <Volume2 size={17} />
              </button>
              <Thiago />
              <span className="art-note">
                Temporary character study · approved artwork pending
              </span>
              <div className="little-leaf">
                <Leaf size={42} />
              </div>
            </div>
          </section>
          <section className="worlds">
            <div className="section-heading">
              <div>
                <span className="eyebrow">FOLLOW YOUR CURIOSITY</span>
                <h2>Where shall we play today?</h2>
              </div>
              <span className="gentle-label">
                <Sun size={18} /> A little learning. A lot of fun.
              </span>
            </div>
            <div className="world-grid">
              <motion.button
                whileHover={{ y: -5 }}
                className="world-card featured"
                disabled={!ready}
                onClick={start}
              >
                <div className="card-art garden-art">
                  <span className="card-sun" />
                  <span className="illustrated-flower f1">✿</span>
                  <span className="illustrated-flower f2">✿</span>
                  <span className="illustrated-flower f3">✿</span>
                  <span className="leaf-one">❧</span>
                  <span className="play-badge">
                    <Play size={24} fill="currentColor" />
                  </span>
                  <span className="ready-label">LET’S PLAY</span>
                </div>
                <div className="card-copy">
                  <div>
                    <span className="card-category">COLOURS & MATCHING</span>
                    <h3>Colour Garden</h3>
                    <p>A blooming lovely colour adventure.</p>
                  </div>
                  <span className="circle-link">
                    <Play size={18} fill="currentColor" />
                  </span>
                </div>
                <div className="card-footer">
                  <span>
                    <Flower2 size={15} /> 3 playful rounds
                  </span>
                  <span>2–6 years</span>
                </div>
              </motion.button>
              {[
                {
                  title: "Word Wonderland",
                  category: "WORDS & COMMUNICATION",
                  text: "Little words. Wonderful discoveries.",
                  icon: BookOpen,
                  cls: "words",
                  symbol: "Aa",
                },
                {
                  title: "Number Jungle",
                  category: "NUMBERS & COUNTING",
                  text: "Every little number counts.",
                  icon: Blocks,
                  cls: "numbers",
                  symbol: "1 2 3",
                },
                {
                  title: "Shape Safari",
                  category: "SHAPES & PROBLEM-SOLVING",
                  text: "A world of shapes to discover.",
                  icon: Shapes,
                  cls: "shapes",
                  symbol: "● ▲ ■",
                },
              ].map((w) => (
                <article className={`world-card future ${w.cls}`} key={w.title}>
                  <div className="card-art">
                    <w.icon
                      className="world-icon"
                      size={84}
                      strokeWidth={1.3}
                    />
                    <span className="card-symbol">{w.symbol}</span>
                    <span className="coming">GROWING SOON</span>
                  </div>
                  <div className="card-copy">
                    <div>
                      <span className="card-category">{w.category}</span>
                      <h3>{w.title}</h3>
                      <p>{w.text}</p>
                    </div>
                  </div>
                  <div className="card-footer">
                    <span>In our next chapter</span>
                    <Leaf size={15} />
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section className="bottom-note">
            <div className="note-icon">
              <Heart size={24} />
            </div>
            <div>
              <h3>Small steps. Happy discoveries.</h3>
              <p>
                No scores to chase. No rush to grow. Just a safe space to try,
                play and be curious.
              </p>
            </div>
            <span className="note-decoration">
              <Leaf size={28} />
              <Music2 size={26} />
            </span>
          </section>
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
