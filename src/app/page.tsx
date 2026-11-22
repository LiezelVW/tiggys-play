"use client";
import {
  setMusicTrack,
  setMusicVolume,
  setEffectsVolume,
  pauseSoundscape,
} from "../game/soundscape";
import { useEffect, useState } from "react";

import { Volume2, VolumeX, ShieldCheck, Sun, X, Check } from "lucide-react";
import { useDialogFocus } from "../components/useDialogFocus";
import { initialiseVoiceClips } from "../game/recordings";
import { useVoiceCount } from "../components/useVoice";
import LoadingGate from "../components/LoadingGate";
import VoicePreview from "../components/VoicePreview";
import Activity from "../components/Activity";
import { activityIds, type ActivityId } from "../game/activities";
import {
  initialiseCandidates,
  subscribeCandidates,
} from "../game/voiceCandidates";
import { subscribeVoice } from "../game/recordings";
import { useVoiceAvailable } from "../components/useVoice";
import VoiceRecorder from "../components/VoiceRecorder";
import World, { type GameId } from "../components/World";
import MonsterTruck from "../components/MonsterTruck";
import Garden from "../components/Garden";
import {
  setMuted,
  setVolume,
  unlockAudio,
  preloadVoice,
  speak,
} from "../game/audio";
type Progress = {
  completed: number;
  minutes: number;
  trucks?: number;
  activities?: Partial<Record<ActivityId, number>>;
};
export default function Page() {
  const recordedVoices = useVoiceCount();
  const hasTiggyVoice = useVoiceAvailable("lets-play");
  const [showStudio, setShowStudio] = useState(false);
  const [volume, updateVolume] = useState(0.7);
  const [musicVolume, updateMusicVolume] = useState(0.18),
    [effectsVolume, updateEffectsVolume] = useState(0.45);
  const [showRecorder, setShowRecorder] = useState(false);
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [game, setGame] = useState<GameId | null>(null);
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
  useDialogFocus(
    parent || !!notice || paused,
    parent ? "parent" : notice ? "privacy" : "break",
  );
  useEffect(() => {
    setReady(true);
    try {
      if (sessionStorage.getItem("tiggy-entered-session") === "1") {
        setEntered(true);
        setShowLoading(false);
      }
    } catch {}
    void Promise.all([initialiseVoiceClips(), initialiseCandidates()]).then(
      preloadVoice,
    );
    const a = subscribeVoice(preloadVoice),
      b = subscribeCandidates(preloadVoice);
    document.addEventListener("pointerdown", unlockAudio, true);
    document.addEventListener("keydown", unlockAudio, true);
    try {
      const p = localStorage.getItem("tiggy-progress");
      if (p) {
        const saved = JSON.parse(p);
        if (Number.isSafeInteger(saved.completed) && saved.completed >= 0)
          setProgress({
            completed: saved.completed,
            minutes: 0,
            activities: Object.fromEntries(
              activityIds
                .filter(
                  (id) =>
                    Number.isSafeInteger(saved.activities?.[id]) &&
                    saved.activities[id] >= 0,
                )
                .map((id) => [id, saved.activities[id]]),
            ),
            trucks:
              Number.isSafeInteger(saved.trucks) && saved.trucks >= 0
                ? saved.trucks
                : 0,
          });
      }
      const m = localStorage.getItem("tiggy-muted") === "true";
      updateMuted(m);
      setMuted(m);
      const savedVolume = localStorage.getItem("tiggy-volume");
      const v = savedVolume === null ? 0.7 : Number(savedVolume);
      if (Number.isFinite(v) && v >= 0 && v <= 1) {
        updateVolume(v);
        setVolume(v);
      }
      for (const [key, setter, apply, fallback] of [
        ["tiggy-music-volume", updateMusicVolume, setMusicVolume, 0.18],
        ["tiggy-effects-volume", updateEffectsVolume, setEffectsVolume, 0.45],
      ] as const) {
        const stored = localStorage.getItem(key),
          value = stored === null ? fallback : Number(stored);
        if (Number.isFinite(value) && value >= 0 && value <= 1) {
          setter(value);
          apply(value);
        }
      }
      const l = Number(localStorage.getItem("tiggy-limit"));
      if ([10, 15, 20, 30].includes(l)) setLimit(l);
    } catch {
      /* Storage unavailable: session-only play. */
    }
    return () => {
      a();
      b();
      document.removeEventListener("pointerdown", unlockAudio, true);
      document.removeEventListener("keydown", unlockAudio, true);
    };
  }, []);
  useEffect(() => {
    if (!ready || !entered || paused || parent) return;
    let last = Date.now();
    const t = setInterval(() => {
      const elapsed = (Date.now() - last) / 1000;
      last = Date.now();
      setSession((s) => {
        if (s + elapsed >= limit * 60) setPaused(true);
        return s + elapsed;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [ready, entered, parent, paused, limit]);
  useEffect(() => {
    setMusicTrack(game || "world");
  }, [game]);
  useEffect(() => {
    const sync = () =>
      pauseSoundscape(parent || paused || !!notice || document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [parent, paused, notice]);
  function sound() {
    const m = !muted;
    updateMuted(m);
    setMuted(m);
    try {
      localStorage.setItem("tiggy-muted", String(m));
    } catch {}
  }
  function completed(id: GameId) {
    setProgress((p) => {
      const value = {
        completed: p.completed + (id === "garden" ? 1 : 0),
        trucks: (p.trucks || 0) + (id === "trucks" ? 1 : 0),
        minutes: Math.ceil(session / 60),
        activities: {
          ...p.activities,
          ...(id !== "garden" && id !== "trucks"
            ? { [id]: (p.activities?.[id] || 0) + 1 }
            : {}),
        },
      };
      try {
        localStorage.setItem("tiggy-progress", JSON.stringify(value));
      } catch {}
      return value;
    });
  }
  function start(id: GameId) {
    setGame(id);
    if (id !== "garden" && id !== "trucks") return;
    speak(
      id === "garden"
        ? "Let’s match the flowers to their colour baskets."
        : "Find the red truck!",
      id === "garden" ? "intro" : "truck-red",
    );
  }
  return (
    <>
      {showLoading && (
        <LoadingGate
          muted={muted}
          onSound={sound}
          onEnter={() => {
            try {
              sessionStorage.setItem("tiggy-entered-session", "1");
            } catch {}
            setEntered(true);
            // Present the decoded world behind the welcome before removing the cover.
            requestAnimationFrame(() =>
              requestAnimationFrame(() => setShowLoading(false)),
            );
          }}
        />
      )}
      <div
        inert={!entered}
        aria-hidden={!entered ? true : undefined}
        style={{ display: entered ? undefined : "none" }}
      >
        <header>
          <button
            className="brand"
            onClick={() => setGame(null)}
            aria-label="Tiggy’s Play home"
          >
            <img
              src="/assets/branding/tiggys-play-logo.svg"
              className="brand-logo"
              alt="Tiggy’s Kids — supplied character logo"
              width="384"
              height="66"
            />
          </button>
          <nav>
            <span className="nav-current">My adventure world</span>
            <button
              className="icon-button"
              disabled={!ready}
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
        {game === "garden" ? (
          <Garden
            onHome={() => setGame(null)}
            onComplete={() => completed("garden")}
            suspended={parent || paused || !!notice}
          />
        ) : game === "trucks" ? (
          <MonsterTruck
            onHome={() => setGame(null)}
            onComplete={() => completed("trucks")}
            suspended={parent || paused || !!notice}
          />
        ) : game ? (
          <Activity
            key={game}
            id={game}
            onHome={() => setGame(null)}
            onComplete={() => completed(game)}
            suspended={parent || paused || !!notice}
          />
        ) : (
          <World
            onPlay={start}
            ready={ready}
            paused={!entered || parent || paused || !!notice}
          />
        )}
        <footer>
          <span>© {new Date().getFullYear()} Tiggy’s Play</span>
          <span>Made with love, inspired by Thiago.</span>
          <button
            onClick={() => {
              setNotice(
                "This app stores only completed garden and truck adventures, sound preferences and a time limit on this device. No account, advertising or analytics. Voice candidates and optional recordings stay on this device and can be deleted in Grown-ups. Delete local progress in Grown-ups.",
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
                  <p>
                    To open the parent area, what is six multiplied by seven?
                  </p>
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
                      <small>{progress.trucks || 0} truck adventures</small>
                    </strong>
                    <strong>
                      {Object.values(progress.activities || {}).reduce(
                        (a, b) => a + (b || 0),
                        0,
                      )}
                      <small>other adventures</small>
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
                    {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}{" "}
                    Sound {muted ? "off" : "on"}
                  </button>
                  <label className="volume-setting">
                    Voice volume · {Math.round(volume * 100)}%
                    <input
                      aria-label="Sound volume"
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(volume * 100)}
                      onChange={(e) => {
                        const v = Number(e.target.value) / 100;
                        updateVolume(v);
                        setVolume(v);
                        try {
                          localStorage.setItem("tiggy-volume", String(v));
                        } catch {}
                      }}
                    />
                  </label>
                  <label className="setting">
                    Music volume · {Math.round(musicVolume * 100)}%
                    <input
                      aria-label="Music volume"
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(musicVolume * 100)}
                      onChange={(e) => {
                        const v = Number(e.target.value) / 100;
                        updateMusicVolume(v);
                        setMusicVolume(v);
                        try {
                          localStorage.setItem("tiggy-music-volume", String(v));
                        } catch {}
                      }}
                    />
                  </label>
                  <label className="setting">
                    Effects volume · {Math.round(effectsVolume * 100)}%
                    <input
                      aria-label="Effects volume"
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(effectsVolume * 100)}
                      onChange={(e) => {
                        const v = Number(e.target.value) / 100;
                        updateEffectsVolume(v);
                        setEffectsVolume(v);
                        try {
                          localStorage.setItem(
                            "tiggy-effects-volume",
                            String(v),
                          );
                        } catch {}
                      }}
                    />
                  </label>
                  <button
                    className="pill"
                    onClick={() => setShowStudio((v) => !v)}
                  >
                    {showStudio
                      ? "Close voice studio"
                      : "Voice preview & approval"}
                  </button>
                  {showStudio && <VoicePreview muted={muted || volume === 0} />}

                  {recordedVoices === 0 && !hasTiggyVoice && (
                    <p className="small-print">
                      Dialogue audio is unavailable until you approve a voice
                      pack or save recordings. Speech bubbles and Gentle sound
                      effects and visual prompts remain available.
                    </p>
                  )}
                  <button
                    className="pill"
                    onClick={() => setShowRecorder((v) => !v)}
                  >
                    {showRecorder
                      ? "Close voice recorder"
                      : "Record Tiggy’s voice"}
                  </button>
                  {showRecorder && <VoiceRecorder />}
                  <p className="small-print">
                    Microphone access is optional and only starts when a
                    grown-up presses Record. Recommendation: Colour Garden, with
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
              <p>
                Let’s stretch, have a drink and explore the world around us.
              </p>
              <button
                autoFocus
                className="primary"
                onClick={() => {
                  setGame(null);
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
      </div>
    </>
  );
}
