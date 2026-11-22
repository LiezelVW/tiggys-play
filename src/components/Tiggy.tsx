"use client";
import { useEffect, useRef, useState } from "react";
import { useVoiceAvailable } from "./useVoice";
import { speak, chime } from "../game/audio";
import { subscribeCharacterDialogue } from "../game/characterDialogue";
import { tiggyRig } from "../game/tiggyRig";
import { mountTiggyRig, type TiggyRenderer } from "../game/tiggyRiveRuntime";
export default function Tiggy() {
  const hasHello = useVoiceAvailable("tiggy-hello"),
    hasPlay = useVoiceAvailable("lets-play");
  const canvas = useRef<HTMLCanvasElement>(null),
    renderer = useRef<TiggyRenderer | undefined>(undefined);
  const [ready, setReady] = useState(false);
  useEffect(
    () =>
      subscribeCharacterDialogue((speaker, speaking) => {
        if (speaker === "tiggy")
          renderer.current?.trigger(speaking ? "Talk" : "Idle");
      }),
    [],
  );
  useEffect(() => {
    if (!canvas.current || !tiggyRig.src) return;
    const abort = new AbortController();
    const visible = () =>
      document.hidden ? renderer.current?.pause() : renderer.current?.resume();
    document.addEventListener("visibilitychange", visible);
    void mountTiggyRig(canvas.current, abort.signal)
      .then((rig) => {
        if (abort.signal.aborted) {
          rig?.dispose();
          return;
        }
        renderer.current = rig;
        setReady(!!rig);
        rig?.trigger("Wave");
        visible();
      })
      .catch((error) =>
        console.warn("Original Tiggy artwork retained:", error.message),
      );
    return () => {
      abort.abort();
      renderer.current?.dispose();
      renderer.current = undefined;
      document.removeEventListener("visibilitychange", visible);
    };
  }, []);
  return (
    <button
      className="tiggy-character"
      aria-label="Say hello to Tiggy"
      data-character-renderer={ready ? "rive" : "original-static"}
      onClick={() => {
        renderer.current?.trigger("Wave");
        if (hasHello)
          speak("Hello! I’m Tiggy. Ready for an adventure?", "tiggy-hello");
        else if (hasPlay) speak("Let’s play!", "lets-play");
        else chime();
      }}
    >
      {/* The unchanged source illustration is not presented as an animated rig. */}
      <img
        src={tiggyRig.neutral}
        alt="Tiggy, Thiago’s original illustrated character"
        style={{ visibility: ready ? "hidden" : "visible" }}
      />
      <canvas
        ref={canvas}
        width={320}
        height={320}
        aria-hidden="true"
        style={{ visibility: ready ? "visible" : "hidden" }}
      />
    </button>
  );
}
