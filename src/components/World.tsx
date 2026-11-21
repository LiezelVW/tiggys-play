"use client";
import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  LockKeyhole,
  Volume2,
  Sparkles,
} from "lucide-react";
import { useVoiceAvailable } from "./useVoice";
import Tiggy from "./Tiggy";
import { speak, chime } from "../game/audio";
export type GameId = "garden" | "trucks";
const areas = [
  { name: "Monster Truck Mayhem", x: 16, y: 31, game: "trucks" },
  { name: "Little Builders", x: 51, y: 29 },
  { name: "Tiggy’s Railway", x: 84, y: 31 },
  { name: "Colour Garden", x: 14, y: 59, game: "garden" },
  { name: "Science Lab", x: 49, y: 60 },
  { name: "Build & Solve", x: 78, y: 55 },
  { name: "Ready, Set, Go!", x: 89, y: 68 },
] as const;
export default function World({
  onPlay,
  ready,
}: {
  onPlay: (game: GameId) => void;
  ready: boolean;
}) {
  const hasNarration = useVoiceAvailable("world-welcome");
  const view = useRef<HTMLDivElement>(null);
  const artwork = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [spark, setSpark] = useState(false);
  useEffect(() => {
    if (artwork.current?.complete) {
      if (artwork.current.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
    }
  }, []);
  function pan(dir: number) {
    view.current?.scrollBy({
      left: dir * view.current.clientWidth * 0.75,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  return (
    <main className="world-home" aria-label="Tiggy’s adventure playground">
      <div
        className="world-camera"
        ref={view}
        tabIndex={0}
        aria-label="Adventure map. Swipe sideways or use the explore buttons to see the whole world."
      >
        <div className="world-landscape">
          <img
            className="world-background"
            ref={artwork}
            src="/assets/world/adventure-world.webp"
            alt="An illustrated adventure playground with a truck arena, diggers, railway, flower garden, science lab and race track"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            draggable={false}
          />
          {!loaded && !failed && (
            <p className="world-loading" role="status">
              Opening your adventure…
            </p>
          )}
          {failed && (
            <div className="world-loading" role="alert">
              The world illustration couldn’t load. You can still play using the
              buttons below.
            </div>
          )}
          <button
            className="sun-touch"
            aria-label="Play a sunshine sound"
            onClick={() => {
              chime();
              setSpark(true);
              setTimeout(() => setSpark(false), 900);
            }}
          >
            {spark && <Sparkles size={42} />}
          </button>
          {areas.map((area) => (
            <div
              className={`map-place ${"game" in area ? "available" : "unavailable"}`}
              key={area.name}
              style={{ left: `${area.x}%`, top: `${area.y}%` }}
            >
              {"game" in area ? (
                <button
                  disabled={!ready}
                  onClick={() => onPlay(area.game)}
                  aria-label={`Play ${area.name}`}
                >
                  <span className="map-play">
                    <Play size={19} fill="currentColor" />
                  </span>
                  <span>
                    {area.name}
                    <small>LET’S PLAY</small>
                  </span>
                </button>
              ) : (
                <div aria-label={`${area.name}, coming soon`}>
                  <LockKeyhole size={15} />
                  <span>
                    {area.name}
                    <small>GROWING SOON</small>
                  </span>
                </div>
              )}
            </div>
          ))}
          <Tiggy />
          <div className="world-truck" aria-hidden="true">
            <img
              src="/assets/vehicles/truck-red.png"
              alt=""
              draggable={false}
            />
            <i className="world-wheel rear" />
            <i className="world-wheel front" />
          </div>
          <button
            className="world-welcome"
            disabled={!ready || !hasNarration}
            onClick={() =>
              speak(
                "Welcome to Tiggy’s Play! Tap the truck to drive, or pick flowers in Colour Garden.",
                "world-welcome",
              )
            }
          >
            <Volume2 size={22} />
            <span>
              Let’s explore!
              <small>
                {hasNarration
                  ? "Tap to hear Tiggy’s welcome"
                  : "Pick an adventure to play"}
              </small>
            </span>
          </button>
        </div>
      </div>
      <div className="explore-controls">
        <button
          className="round-button"
          aria-label="Explore left"
          onClick={() => pan(-1)}
        >
          <ChevronLeft />
        </button>
        <span>Swipe to explore your world</span>
        <button
          className="round-button"
          aria-label="Explore right"
          onClick={() => pan(1)}
        >
          <ChevronRight />
        </button>
      </div>
      <nav className="play-dock" aria-label="Playable adventures">
        <button
          className="dock-truck"
          disabled={!ready}
          onClick={() => onPlay("trucks")}
        >
          <Play fill="currentColor" />
          <span>
            Monster Truck Mayhem<small>DRIVE · JUMP · DISCOVER COLOURS</small>
          </span>
        </button>
        <button
          className="dock-garden"
          disabled={!ready}
          onClick={() => onPlay("garden")}
        >
          <Play fill="currentColor" />
          <span>
            Colour Garden<small>MATCH · PLANT · GROW</small>
          </span>
        </button>
      </nav>
    </main>
  );
}
