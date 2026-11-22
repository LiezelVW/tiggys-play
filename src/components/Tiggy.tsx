"use client";
import { useEffect, useRef, useState } from "react";
import { useVoiceAvailable } from "./useVoice";
import { speak, chime } from "../game/audio";
import { subscribeCharacterDialogue } from "../game/characterDialogue";
import { TiggyAnimator } from "../game/TiggyAnimator";
import type { CharacterAction } from "../game/tiggyPose";
export default function Tiggy({ paused = false }: { paused?: boolean }) {
  const hasHello = useVoiceAvailable("tiggy-hello"),
    hasPlay = useVoiceAvailable("lets-play");
  const canvas = useRef<HTMLCanvasElement>(null),
    animator = useRef<TiggyAnimator | null>(null),
    drag = useRef<{ x: number; offset: number; moved: boolean } | null>(null);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if (!canvas.current) return;
    const rig = new TiggyAnimator(canvas.current);
    animator.current = rig;
    rig.play("Wave");
    let frame = 0,
      last = 0;
    const tick = (time: number) => {
      if (!document.hidden && !paused) {
        rig.update(last ? Math.min((time - last) / 1000, 0.05) : 0);
      }
      last = time;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const unsubscribe = subscribeCharacterDialogue((speaker, speaking) => {
      if (speaker === "tiggy") rig.setSpeaking(speaking);
    });
    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
      animator.current = null;
    };
  }, [paused]);
  const play = (action: CharacterAction) => animator.current?.play(action);
  return (
    <button
      className="tiggy-character"
      aria-label="Say hello to Tiggy"
      data-character-renderer="layered-vector"
      style={{ transform: `translateX(${offset}px)` }}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, offset, moved: false };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const distance = e.clientX - drag.current.x;
        if (Math.abs(distance) > 8) {
          drag.current.moved = true;
          if (animator.current?.action !== "Walk") play("Walk");
          setOffset(
            Math.max(-80, Math.min(180, drag.current.offset + distance)),
          );
        }
      }}
      onPointerUp={() => {
        if (drag.current?.moved) play("Happy");
      }}
      onPointerCancel={() => {
        drag.current = null;
        play("Idle");
      }}
      onClick={() => {
        if (drag.current?.moved) {
          drag.current = null;
          return;
        }
        play("Wave");
        if (hasHello)
          speak("Hello! I’m Tiggy. Ready for an adventure?", "tiggy-hello");
        else if (hasPlay) speak("Let’s play!", "lets-play");
        else chime();
      }}
      onKeyDown={(e) => {
        const keys: Record<string, CharacterAction> = {
          ArrowRight: "Walk",
          ArrowLeft: "Walk",
          w: "Wave",
          t: "Talk",
          c: "Clap",
          j: "Celebrate",
          q: "Thinking",
          h: "Help",
          l: "Happy",
          Escape: "Idle",
        };
        if (keys[e.key]) {
          e.preventDefault();
          play(keys[e.key]);
        }
      }}
      onKeyUp={(e) => {
        if (e.key.startsWith("Arrow")) play("Idle");
      }}
    >
      <canvas
        ref={canvas}
        width={400}
        height={600}
        role="img"
        aria-label="Animated Tiggy using your original vector artwork"
      />
    </button>
  );
}
