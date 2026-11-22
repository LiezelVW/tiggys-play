"use client";
import { useEffect, useState } from "react";
import { tiggyAsset, type TiggyState } from "../game/tiggyAnimations";
import { useVoiceAvailable } from "./useVoice";
import { speak, chime } from "../game/audio";
/** Real frame changes from a shared transparent sprite atlas; no CSS-translated stand-in. */
export default function Tiggy() {
  const hasHello = useVoiceAvailable("tiggy-hello");
  const hasPlay = useVoiceAvailable("lets-play");
  const hasNarration = hasHello || hasPlay;
  const [state, setState] = useState<TiggyState>("wave");
  const [frame, setFrame] = useState(4);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFrame(tiggyAsset.states[state][0]);
      return;
    }
    const frames = tiggyAsset.states[state];
    let i = 0;
    setFrame(frames[0]);
    const t = setInterval(
      () => {
        i++;
        if (i >= frames.length) {
          clearInterval(t);
          setState("idle");
          setFrame(0);
        } else setFrame(frames[i]);
      },
      state === "blink" ? 100 : 160,
    );
    return () => clearInterval(t);
  }, [state]);
  useEffect(() => {
    const t = setInterval(
      () => setState((s) => (s === "idle" ? "blink" : s)),
      4500,
    );
    return () => clearInterval(t);
  }, []);
  return (
    <button
      className="tiggy-character"
      aria-label="Say hello to Tiggy"
      data-animation={state}
      onClick={() => {
        setState(hasNarration ? "talk" : "wave");
        if (!hasNarration) {
          chime();
          return;
        }
        if (hasHello)
          speak("Hello! I’m Tiggy. Ready for an adventure?", "tiggy-hello");
        else speak("Let’s play!", "lets-play");
      }}
    >
      <span
        role="img"
        aria-label="Tiggy, the approved smooth-haired toddler in a navy hoodie and yellow construction vest"
        style={{
          backgroundImage: `url(${tiggyAsset.source})`,
          backgroundPosition: `${((frame % 4) * 100) / 3}% ${(Math.floor(frame / 4) * 100) / 5}%`,
        }}
      />
    </button>
  );
}
