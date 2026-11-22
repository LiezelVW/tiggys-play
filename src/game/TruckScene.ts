import { celebrationLine } from "./voiceCandidates";
import { promptText } from "./voicePrompts";
import * as Phaser from "phaser";
import { TruckSprite } from "./TruckSprite";
import { TiggySprite } from "./TiggySprite";
import { colours, type Colour } from "./rules";
import { arenaTrack, surfaceY, truckPose, type Track } from "./truckTrack";
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
  private track!: Track;
  private round = 0;
  private phase: TruckPhase = "choose";
  private reduced = false;
  private portrait = false;
  private startX = 130;
  private endX = 850;
  private step = 180;
  private destination = 130;
  private speed = 0;
  private lift = 0;
  private jumpVelocity = 0;
  private reportElapsed = 0;
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
    this.load.image("truck-arena", "/assets/world/truck-arena-flat.webp");
  }
  create() {
    this.portrait = this.scale.width === 600;
    if (this.portrait) {
      this.startX = 100;
      this.endX = 500;
      this.step = 100;
    }
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.track = arenaTrack(this.scale.width, this.scale.height);
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, "truck-arena")
      .setDisplaySize(1000, (1000 * 1024) / 1536);
    this.drawRamp();
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
  private drawRamp() {
    const g = this.add.graphics(),
      p = this.track.points;
    const border = p.map((v) => ({ x: v.x, y: v.y + 2 }));
    const outline = [
      ...border,
      { x: p[p.length - 1].x, y: this.track.groundY + 5 },
      { x: p[0].x, y: this.track.groundY + 5 },
    ];
    g.fillStyle(0xd38a2f).fillPoints(outline, true);
    for (
      let x = p[0].x + 15;
      x < p[p.length - 1].x - 8;
      x += this.portrait ? 18 : 25
    ) {
      const y = surfaceY(this.track, x) + 7;
      if (y < this.track.groundY - 3) {
        g.lineStyle(2, 0x985c21, 0.6).lineBetween(
          x,
          y,
          x,
          this.track.groundY + 2,
        );
        g.lineStyle(1, 0xf5bc58, 0.8).lineBetween(
          x + 3,
          y + 2,
          x + 3,
          this.track.groundY + 1,
        );
      }
    }
    g.lineStyle(4, 0x18354b).strokePoints(outline, true);
    g.lineStyle(5, 0x18354b).strokePoints(border, false);
    g.lineStyle(2, 0xffcd65).strokePoints(
      border.map((v) => ({ x: v.x, y: v.y + 3 })),
      false,
    );
    for (const x of [this.scale.width / 2 - 24, this.scale.width / 2 + 24]) {
      const y = (surfaceY(this.track, x) + this.track.groundY) / 2;
      g.fillStyle(0x18354b).fillCircle(x, y, 4);
      g.fillStyle(0xf9daa0).fillCircle(x, y, 2);
    }
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
    this.trucks.forEach((t) => t.destroy());
    this.trucks = [];
    this.truck = undefined;
    this.speed = 0;
    this.lift = 0;
    this.jumpVelocity = 0;
    colours.forEach((c, i) => {
      const x = this.portrait ? 100 + i * 200 : 190 + i * 310,
        scale = this.portrait ? 0.57 : 0.85;
      const t = new TruckSprite(this, x, 0, c.name, scale);
      // Park the choices on the clear foreground lane, rather than inside the obstacle.
      const y = this.track.groundY + 55 - 80 * scale;
      t.root.y = y;
      t.groundShadow(this.track.groundY + 55);
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
      if (t !== this.truck) t.setVisible(false);
    });
    const scale = this.portrait ? 0.68 : 0.85;
    this.truck.root.setScale(scale);
    this.destination = this.startX;
    this.speed = 0;
    this.lift = 0;
    this.jumpVelocity = 0;
    this.reportElapsed = 0;
    this.truck.applyPose(
      truckPose(this.track, this.startX, scale),
      surfaceY(this.track, this.startX),
    );
    this.phase = "drive";
    this.boy.play("celebrate");
    this.say(
      "Tap the big wheel to drive. Let’s go over the ramp!",
      "truck-drive",
    );
    this.emit();
  }
  /** Every tap queues travel, including taps received while already driving. */
  drive() {
    if (this.phase !== "drive" || !this.truck) return;
    this.destination = Math.min(this.endX, this.destination + this.step);
  }
  jump() {
    if (
      this.phase !== "drive" ||
      this.reduced ||
      this.lift > 0 ||
      this.jumpVelocity > 0
    )
      return;
    this.jumpVelocity = this.portrait ? 300 : 350;
  }
  update(_time: number, delta: number) {
    if (this.phase !== "drive" || !this.truck) return;
    const dt = Math.min(delta, 50) / 1000,
      root = this.truck.root,
      previousX = root.x,
      previousY = root.y;
    const remaining = this.destination - root.x;
    if (remaining > 0.05) {
      const acceleration = this.portrait ? 750 : 1000,
        cruise = this.portrait ? 170 : 280;
      const targetSpeed = Math.min(
        cruise,
        Math.sqrt(2 * acceleration * remaining),
      );
      this.speed = Math.min(targetSpeed, this.speed + acceleration * dt);
      root.x = Math.min(this.destination, root.x + this.speed * dt);
      if (this.destination - root.x < 0.5) {
        root.x = this.destination;
        this.speed = 0;
      }
    } else this.speed = 0;
    if (this.jumpVelocity !== 0 || this.lift > 0) {
      this.lift += this.jumpVelocity * dt;
      this.jumpVelocity -= 900 * dt;
      if (this.lift <= 0) {
        this.lift = 0;
        this.jumpVelocity = 0;
      }
    }
    const pose = truckPose(this.track, root.x, root.scaleX, this.lift);
    this.truck.applyPose(pose, surfaceY(this.track, root.x), this.lift);
    const travel = Math.hypot(root.x - previousX, root.y - previousY);
    if (root.x !== previousX) this.truck.rotate(travel);
    this.reportElapsed += delta;
    if (this.reportElapsed >= 120) {
      this.emit();
      this.reportElapsed = 0;
    }
    if (root.x >= this.endX && this.lift === 0) this.finishRound();
  }
  private finishRound() {
    this.phase = "finish";
    this.success();
    this.boy.play("celebrate");
    if (!this.reduced)
      for (let i = 0; i < 28; i++) {
        const star = this.add.star(
          40 + Math.random() * (this.scale.width - 80),
          80 + Math.random() * 160,
          5,
          4,
          9,
          colours[i % 3].hex,
        );
        this.tweens.add({
          targets: star,
          y: star.y + 180,
          alpha: 0,
          angle: 150,
          duration: 1200,
          onComplete: () => star.destroy(),
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
    const praise = celebrationLine(this.round, "truck-next");
    this.say(promptText(praise), praise);
    this.round++;
    this.time.delayedCall(1500, () => this.chooseRound());
    this.emit();
  }
}
