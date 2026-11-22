"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { tiggyActions, tiggyRig, type TiggyAction } from "../../game/tiggyRig";
import { mountTiggyRig, type TiggyRenderer } from "../../game/tiggyRiveRuntime";
/** Parent-only local export review. This cannot author Rive bones or verify their quality. */
export default function CharacterLab() {
  const [answer, setAnswer] = useState(""),
    [unlocked, setUnlocked] = useState(false);
  const [file, setFile] = useState<File | null>(null),
    [ready, setReady] = useState(false);
  const [message, setMessage] = useState(
    "No finished .riv export supplied. Showing your unchanged neutral artwork; it is static.",
  );
  const [action, setAction] = useState<TiggyAction>("Idle");
  const canvas = useRef<HTMLCanvasElement>(null),
    renderer = useRef<TiggyRenderer | undefined>(undefined);
  useEffect(() => {
    if (!file || !canvas.current || !unlocked) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMessage(
        "Reduced motion is enabled. Showing original static artwork; animation review is paused.",
      );
      return;
    }
    const url = URL.createObjectURL(file),
      abort = new AbortController();
    setReady(false);
    setMessage(
      "Checking the exported artboard, state machine and all eight triggers…",
    );
    const visible = () =>
      document.hidden ? renderer.current?.pause() : renderer.current?.resume();
    document.addEventListener("visibilitychange", visible);
    void mountTiggyRig(canvas.current, abort.signal, url)
      .then((rig) => {
        if (abort.signal.aborted) {
          rig?.dispose();
          return;
        }
        renderer.current = rig;
        setReady(!!rig);
        visible();
        setMessage(
          rig
            ? "Runtime contract loaded. Test every action below. Bones, constraints, pivots and movement quality still require visual review in Rive; passing this check does not certify a finished rig."
            : "Animation unavailable. Original static artwork retained.",
        );
      })
      .catch((error) => {
        if (!abort.signal.aborted)
          setMessage(
            `Rig not accepted: ${error.message}. Original static artwork retained.`,
          );
      });
    return () => {
      abort.abort();
      renderer.current?.dispose();
      renderer.current = undefined;
      URL.revokeObjectURL(url);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [file, unlocked]);
  if (!unlocked)
    return (
      <main className="rig-lab">
        <Link href="/">Back to my world</Link>
        <h1>Character rig review</h1>
        <p>Grown-ups: what is 6 × 7?</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (answer.trim() === "42") setUnlocked(true);
          }}
        >
          <label>
            Your answer
            <input
              inputMode="numeric"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </label>
          <button className="pill" type="submit">
            Open rig review
          </button>
        </form>
      </main>
    );
  return (
    <main className="rig-lab">
      <Link href="/">Back to my world</Link>
      <h1>Tiggy’s original character rig</h1>
      <p>
        This review loads a local Rive export on this device only. It does not
        upload, publish or replace the gameplay character.
      </p>
      <p role="status">{message}</p>
      <label>
        Open exported .riv file
        <input
          type="file"
          accept=".riv"
          onChange={(e) => {
            const picked = e.target.files?.[0];
            if (!picked) return;
            if (
              !/\.riv$/i.test(picked.name) ||
              picked.size === 0 ||
              picked.size > 15_000_000
            ) {
              setMessage("Choose a nonempty .riv export under 15 MB.");
              return;
            }
            setFile(picked);
          }}
        />
      </label>
      <div
        className="rig-lab-preview"
        data-renderer={ready ? "rive" : "original-static"}
      >
        <img
          src={tiggyRig.neutral}
          alt="Original Tiggy neutral artwork supplied by the owner"
          style={{ visibility: ready ? "hidden" : "visible" }}
        />
        <canvas
          ref={canvas}
          width={580}
          height={1280}
          aria-label="Exported Tiggy Rive preview"
          style={{ visibility: ready ? "visible" : "hidden" }}
        />
      </div>
      <p>Requested action: {action}</p>
      <div className="rig-lab-actions">
        {tiggyActions.map((name) => (
          <button
            type="button"
            className="pill"
            key={name}
            disabled={!ready}
            onClick={() => {
              renderer.current?.trigger(name);
              setAction(name);
            }}
          >
            {name}
          </button>
        ))}
      </div>
      <p>
        Required export: artboard <code>Tiggy</code>, state machine{" "}
        <code>TiggyController</code>, eight named triggers. The SVG preparation
        and editor acceptance checklist are documented in the repository.
      </p>
    </main>
  );
}
