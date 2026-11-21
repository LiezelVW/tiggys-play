import * as Phaser from "phaser";
import { TruckSprite } from "./TruckSprite";
import { TiggySprite } from "./TiggySprite";
import { colours, type Colour } from "./rules";
export type TruckPhase = "choose" | "drive" | "finish";
export type TruckStatus = {
  phase: TruckPhase;
  round: number;
  completed: number;
  distance: number;
  target: Colour;
};
export class TruckScene extends Phaser.Scene {
  private trucks: TruckSprite[] = [];
  private truck?: TruckSprite;
  private boy!: TiggySprite;
  private round = 0;
  private phase: TruckPhase = "choose";
  private moving = false;
  private lastX = 0;
  private lift = 0;
  private reduced = false;
  private portrait = false;
  private startX = 130;
  private endX = 850;
  private step = 180;
  private baseline = 385;
  constructor(
    private report: (s: TruckStatus) => void,
    private say: (text: string, clip: string) => void,
    private success: () => void,
  ) {
    super("trucks");
  }
  preload() {
    TruckSprite.preload(this);
    TiggySprite.preload(this);
    this.load.image("truck-arena", "/assets/world/truck-arena.webp");
  }
  create() {
    this.portrait = this.scale.width === 600;
    if (this.portrait) {
      this.startX = 120;
      this.endX = 480;
      this.step = 90;
      this.baseline = 440;
    }
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, "truck-arena")
      .setDisplaySize(1000, 667);
    this.boy = new TiggySprite(
      this,
      this.portrait ? 490 : 905,
      this.portrait ? 245 : 275,
    );
    this.input.on("pointerdown", () => {
      if (this.phase === "drive") this.drive();
    });
    this.chooseRound();
  }
  private emit() {
    this.report({
      phase: this.phase,
      round: this.round + 1,
      completed: this.round,
      distance: this.truck
        ? Math.min(
            1,
            (this.truck.root.x - this.startX) / (this.endX - this.startX),
          )
        : 0,
      target: colours[this.round].name,
    });
  }
  private chooseRound() {
    this.phase = "choose";
    this.trucks.forEach((t) => t.root.destroy());
    this.trucks = [];
    this.truck = undefined;
    colours.forEach((c, i) => {
      const t = new TruckSprite(
        this,
        this.portrait ? 100 + i * 200 : 190 + i * 310,
        this.baseline,
        c.name,
        this.portrait ? 0.57 : 0.85,
      );
      t.root
        .setSize(290, 185)
        .setInteractive({ useHandCursor: true })
        .on(
          "pointerdown",
          (
            _p: Phaser.Input.Pointer,
            _x: number,
            _y: number,
            e: Phaser.Types.Input.EventData,
          ) => {
            e.stopPropagation();
            this.choose(c.name);
          },
        );
      this.trucks.push(t);
    });
    this.say(
      `Find the ${colours[this.round].name} truck!`,
      `truck-${colours[this.round].name}`,
    );
    this.boy.play("wave");
    this.emit();
  }
  choose(colour: Colour) {
    if (this.phase !== "choose") return;
    const target = colours[this.round].name;
    if (colour !== target) {
      this.say(
        `Let’s find the ${target} truck. Try another one!`,
        `truck-try-${target}`,
      );
      return;
    }
    this.success();
    this.truck = this.trucks[colours.findIndex((c) => c.name === colour)];
    this.trucks.forEach((t) => {
      t.root.disableInteractive();
      if (t !== this.truck) t.root.setVisible(false);
    });
    this.truck.root
      .setPosition(this.startX, this.baseline)
      .setScale(this.portrait ? 0.72 : 0.85);
    this.lastX = this.startX;
    this.phase = "drive";
    this.boy.play("celebrate");
    this.say(
      "Tap the big wheel to drive. Let’s go over the ramp!",
      "truck-drive",
    );
    this.emit();
  }
  drive() {
    if (this.phase !== "drive" || !this.truck || this.moving) return;
    this.moving = true;
    const target = Math.min(this.endX, this.truck.root.x + this.step);
    this.tweens.add({
      targets: this.truck.root,
      x: target,
      duration: this.reduced ? 100 : 1000,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.moving = false;
        this.emit();
        if (target >= this.endX) this.finishRound();
      },
    });
  }
  jump() {
    if (this.phase !== "drive" || this.lift > 0 || this.reduced) return;
    this.tweens.add({
      targets: this,
      lift: 90,
      duration: 300,
      yoyo: true,
      ease: "Sine.easeOut",
    });
  }
  update() {
    if (this.phase !== "drive" || !this.truck) return;
    const x = this.truck.root.x;
    const rampStart = this.portrait ? 220 : 360,
      rampEnd = this.portrait ? 390 : 650;
    const fraction = (x - rampStart) / (rampEnd - rampStart);
    const ramp =
      !this.reduced && fraction > 0 && fraction < 1
        ? Math.sin(fraction * Math.PI) * (this.portrait ? 85 : 110)
        : 0;
    this.truck.root.y = this.baseline - ramp - this.lift;
    this.truck.root.angle = this.reduced
      ? 0
      : Math.cos(Math.max(0, Math.min(1, fraction)) * Math.PI) *
        (ramp > 0 ? -13 : 0);
    this.truck.rotate(x - this.lastX);
    this.lastX = x;
  }
  private finishRound() {
    this.phase = "finish";
    this.success();
    this.boy.play("celebrate");
    if (!this.reduced)
      for (let i = 0; i < 28; i++) {
        const s = this.add.star(
          130 + Math.random() * 700,
          80 + Math.random() * 160,
          5,
          4,
          9,
          colours[i % 3].hex,
        );
        this.tweens.add({
          targets: s,
          y: s.y + 180,
          alpha: 0,
          angle: 150,
          duration: 1200,
          onComplete: () => s.destroy(),
        });
      }
    if (this.round === 2) {
      this.say(
        "Amazing driving! You found all three colours!",
        "truck-complete",
      );
      this.report({
        phase: "finish",
        round: 3,
        completed: 3,
        distance: 1,
        target: "yellow",
      });
      return;
    }
    this.say("Brilliant! Let’s find another colour.", "truck-next");
    this.round++;
    this.time.delayedCall(1500, () => this.chooseRound());
    this.emit();
  }
}
