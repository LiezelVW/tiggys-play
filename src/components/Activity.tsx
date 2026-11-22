"use client";
import { useEffect, useRef, useState } from "react";
import type Phaser from "phaser";
import { Home, RotateCcw, Volume2, Check } from "lucide-react";
import { activities, type ActivityId } from "../game/activities";
import type { ActivityScene, ActivityStatus } from "../game/ActivityScene";
import { promptText } from "../game/voicePrompts";
import { chime, narrate, speak, stopAudio } from "../game/audio";
import { useVoiceAvailable } from "./useVoice";
import { useDialogFocus } from "./useDialogFocus";
export default function Activity({
  id,
  onHome,
  onComplete,
  suspended,
}: {
  id: ActivityId;
  onHome: () => void;
  onComplete: () => void;
  suspended: boolean;
}) {
  const game = activities[id],
    host = useRef<HTMLDivElement>(null),
    runtime = useRef<Phaser.Game | null>(null),
    scene = useRef<ActivityScene | null>(null),
    done = useRef(onComplete);
  done.current = onComplete;
  const [state, setState] = useState<ActivityStatus>({
      step: 0,
      busy: false,
      finished: false,
      selected: [],
    }),
    [clip, setClip] = useState(game.steps[0].clip),
    [caption, setCaption] = useState(promptText(game.steps[0].clip)),
    [loaded, setLoaded] = useState(false),
    [error, setError] = useState(false),
    [replay, setReplay] = useState(0);
  const hasVoice = useVoiceAvailable(clip, game.character);
  useDialogFocus(state.finished);
  useEffect(() => {
    let disposed = false;
    const resize = new ResizeObserver(() => runtime.current?.scale.refresh());
    if (host.current) resize.observe(host.current);
    Promise.all([import("phaser"), import("../game/ActivityScene")])
      .then(([Phaser, { ActivityScene }]) => {
        if (disposed || !host.current) return;
        const level = new ActivityScene(
          id,
          (s) => {
            setLoaded(true);
            setState(s);
            if (s.finished) done.current();
          },
          (text, key) => {
            setCaption(text);
            setClip(key);
            narrate(text, key, activities[id].character);
          },
          () => chime(),
        );
        scene.current = level;
        const phone = window.innerWidth <= 600;
        runtime.current = new Phaser.Game({
          type: Phaser.CANVAS,
          parent: host.current,
          width: phone ? 600 : 1000,
          height: 550,
          scene: level,
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
          audio: { noAudio: true },
          render: { antialias: true },
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
  }, [id, replay]);
  useEffect(() => {
    const level = scene.current;
    if (!loaded || !level) return;
    if (suspended) {
      level.scene.pause();
      stopAudio();
    } else level.scene.resume();
  }, [loaded, suspended]);
  function restart() {
    stopAudio();
    setLoaded(false);
    setError(false);
    setState({ step: 0, busy: false, finished: false, selected: [] });
    setReplay((r) => r + 1);
  }
  const step = game.steps[state.step];
  return (
    <main
      className="game-page activity-page"
      aria-label={game.name}
      data-step={state.step}
      data-activity={id}
    >
      <div className="game-top">
        <button className="pill" onClick={onHome}>
          <Home size={20} />
          My world
        </button>
        <div>
          <h1>{game.name}</h1>
          <p className="activity-subtitle">{game.subtitle}</p>
        </div>
        <button
          className="round-button"
          aria-label={
            hasVoice
              ? "Hear instructions again"
              : "Dialogue shown in speech bubble"
          }
          disabled={!hasVoice}
          onClick={() => speak(caption, clip, game.character)}
        >
          <Volume2 />
        </button>
      </div>
      <div className="game-instruction speech-bubble" aria-live="polite">
        <span>{caption}</span>
        <strong>
          {state.finished ? game.steps.length : state.step + 1} /{" "}
          {game.steps.length}
        </strong>
      </div>
      {id === "potty" && (
        <p className="small-print routine-note">
          A pretend-play routine. There is no hurry, timer or pressure to use
          the potty. You can finish whenever you like.
        </p>
      )}
      <div
        className="game-canvas activity-canvas"
        ref={host}
        data-ready={loaded && !error}
        aria-label={`${game.name} interactive playfield`}
        role="img"
      />
      {!loaded && !error && <p role="status">Opening your adventure…</p>}
      {error && (
        <div role="alert">
          This adventure could not load.{" "}
          <button className="pill" onClick={restart}>
            Try loading again
          </button>
        </div>
      )}
      <div className="activity-choices" aria-label="Choose an object">
        {step.choices.map((choice) => (
          <button
            key={choice.id}
            className={`activity-choice ${state.selected.includes(choice.id) ? "selected" : ""}`}
            disabled={
              !loaded ||
              suspended ||
              state.busy ||
              state.finished ||
              state.selected.includes(choice.id)
            }
            aria-pressed={state.selected.includes(choice.id)}
            onClick={() => scene.current?.choose(choice.id)}
            aria-label={`Choose ${choice.label.toLowerCase()}`}
          >
            {choice.frame !== undefined ? (
              <span
                className="activity-sprite"
                aria-hidden="true"
                style={{
                  backgroundPosition: `${(choice.frame % 6) * 20}% ${(Math.floor(choice.frame / 6) * 100) / 3}%`,
                }}
              />
            ) : (
              <span
                className="activity-colour"
                style={{
                  backgroundColor: `#${choice.colour!.toString(16).padStart(6, "0")}`,
                }}
                aria-hidden="true"
              />
            )}
            <span>{choice.label}</span>
            {state.selected.includes(choice.id) && <Check size={18} />}
          </button>
        ))}
      </div>
      <div className="activity-tools">
        <button className="pill" onClick={restart}>
          <RotateCcw size={18} />
          Start again
        </button>
        {id === "potty" && (
          <button className="pill" onClick={onHome}>
            All done for now
          </button>
        )}
      </div>
      {state.finished && (
        <div className="modal-backdrop">
          <section
            className="modal celebration"
            role="dialog"
            aria-modal="true"
            aria-labelledby="activity-finished"
          >
            <h2 id="activity-finished">You did it!</h2>
            <p>{game.name} complete. Shall we play again?</p>
            <button className="primary" onClick={restart}>
              <RotateCcw />
              Play again
            </button>
            <button className="pill" onClick={onHome}>
              <Home />
              My world
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
