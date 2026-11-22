import * as Phaser from "phaser";
import { activities, type ActivityId, type Choice } from "./activities";
import { encouragementIds, promptText } from "./voicePrompts";
import { TiggySprite } from "./TiggySprite";
export type ActivityStatus = {
  step: number;
  finished: boolean;
  busy: boolean;
  selected: string[];
};
export class ActivityScene extends Phaser.Scene {
  private step = 0;
  private busy = false;
  private finished = false;
  private chosen: string[] = [];
  private layer!: Phaser.GameObjects.Container;
  private boy!: TiggySprite;
  private bear?: Phaser.GameObjects.Sprite;
  private wheel?: Phaser.GameObjects.Container;
  private cabins: Phaser.GameObjects.Container[] = [];
  private angle = 0;
  private trafficTruck?: Phaser.GameObjects.Image;
  private rides?: Phaser.GameObjects.Text;
  private placed: Choice[] = [];
  private reduced = false;
  constructor(
    private id: ActivityId,
    private report: (s: ActivityStatus) => void,
    private say: (text: string, clip: string) => void,
    private effect: () => void,
  ) {
    super(`activity-${id}`);
  }
  preload() {
    TiggySprite.preload(this);
    this.load.spritesheet(
      "activity-art",
      "/assets/activities/benny-and-objects-flat.webp",
      { frameWidth: 256, frameHeight: 256 },
    );
    this.load.image("activity-truck", "/assets/vehicles/truck-red.png");
  }
  create() {
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const w = this.scale.width,
      h = this.scale.height;
    const g = this.add.graphics();
    g.fillStyle(this.id === "potty" ? 0xe8f3ee : 0xe5f5f4).fillRect(0, 0, w, h);
    g.fillStyle(0xfff8df).fillRoundedRect(25, 28, w - 50, h - 60, 32);
    g.fillStyle(0xcbe6cd).fillEllipse(w / 2, h + 50, w * 1.7, 300);
    g.fillStyle(0xffffff)
      .fillRoundedRect(45, 55, 110, 34, 18)
      .fillRoundedRect(w - 170, 75, 105, 31, 16);
    if (this.id === "breakfast" || this.id === "potty") {
      const room = this.add.graphics();
      room
        .fillStyle(this.id === "breakfast" ? 0xe2c7a1 : 0xc4e3de)
        .fillRoundedRect(29, 410, w - 58, h - 444, 24);
      room.lineStyle(3, 0x143657, 0.25).lineBetween(30, 410, w - 30, 410);
      if (this.id === "potty") {
        for (let x = 50; x < w - 30; x += 70)
          room.lineBetween(x, 410, x, h - 35);
        for (let y = 440; y < h - 35; y += 30)
          room.lineBetween(30, y, w - 30, y);
        room.fillStyle(0x087f80).fillRoundedRect(w / 2 - 100, 455, 200, 48, 20);
      } else {
        room.fillStyle(0xe2f4f3).fillRoundedRect(55, 65, 100, 90, 18);
        room
          .lineStyle(4, 0x143657)
          .strokeRoundedRect(55, 65, 100, 90, 18)
          .lineBetween(105, 65, 105, 155)
          .lineBetween(55, 110, 155, 110);
        room
          .fillStyle(0x7bbcb5)
          .fillRoundedRect(39, 58, 19, 111, 8)
          .fillRoundedRect(152, 58, 19, 111, 8);
        room
          .lineStyle(11, 0x986039)
          .lineBetween(w / 2 - 115, 355, w / 2 - 115, 420)
          .lineBetween(w / 2 + 115, 355, w / 2 + 115, 420);
      }
    }
    this.boy = new TiggySprite(this, w - 90, 150);
    this.layer = this.add.container(0, 0);
    if (this.id === "breakfast") {
      g.fillStyle(0xe7b879).fillEllipse(w / 2, 350, 350, 75);
      g.fillStyle(0xb87948).fillRoundedRect(w / 2 - 140, 350, 280, 20, 10);
      this.bear = this.add
        .sprite(w / 2, 240, "activity-art", 0)
        .setDisplaySize(225, 225);
      if (!this.anims.exists("benny-eat"))
        this.anims.create({
          key: "benny-eat",
          frames: [
            { key: "activity-art", frame: 0 },
            { key: "activity-art", frame: 2 },
            { key: "activity-art", frame: 3 },
            { key: "activity-art", frame: 0 },
          ],
          frameRate: 3,
        });
    }
    if (this.id === "ferris") this.makeWheel();
    this.renderStep();
  }
  private emit() {
    this.report({
      step: this.step,
      finished: this.finished,
      busy: this.busy,
      selected: [...this.chosen],
    });
  }
  private art(x: number, y: number, frame: number, size = 120) {
    return this.add
      .image(x, y, "activity-art", frame)
      .setDisplaySize(size, size);
  }
  private renderStep(showTarget = true, announce = true) {
    this.layer.removeAll(true);
    this.chosen = [];
    const w = this.scale.width,
      step = activities[this.id].steps[this.step];
    if (this.id === "builders") {
      this.placed.forEach((c, i) =>
        this.layer.add(this.art(w / 2, 355 - i * 65, c.frame!, 115)),
      );
      if (showTarget)
        this.layer.add(
          this.art(
            w / 2,
            355 - this.placed.length * 65,
            step.hint!,
            115,
          ).setAlpha(0.2),
        );
      this.layer.add(this.art(100, 365, 19, 155));
    } else if (this.id === "railway") {
      const g = this.add.graphics().lineStyle(5, 0x426363);
      g.lineBetween(55, 360, w - 55, 360).lineBetween(55, 375, w - 55, 375);
      for (let x = 60; x < w - 50; x += 24) g.lineBetween(x, 354, x, 383);
      this.layer.add(g);
      this.placed.forEach((c, i) =>
        this.layer.add(this.art(120 + i * 145, 305, c.frame!, 165)),
      );
      if (showTarget)
        this.layer.add(
          this.art(
            120 + this.placed.length * 145,
            305,
            step.hint!,
            165,
          ).setAlpha(0.2),
        );
    } else if (this.id === "science") this.renderMix();
    else if (this.id === "ready") {
      const g = this.add.graphics();
      g.fillStyle(0x173c50).fillRoundedRect(w / 2 - 42, 125, 84, 240, 28);
      [0xef6c63, 0xf4c54c, 0x4baa85].forEach((colour, i) =>
        g
          .fillStyle(colour, i === this.step ? 1 : 0.22)
          .fillCircle(w / 2, 170 + i * 72, 28),
      );
      this.layer.add(g);
      const truck = this.add
        .image(125, 380, "activity-truck")
        .setDisplaySize(200, 136);
      this.trafficTruck = truck;
      this.layer.add(truck);
    } else if (this.id === "blocks") {
      step.pattern!.forEach((frame, i) =>
        this.layer.add(this.art(w / 2 - 180 + i * 120, 270, frame, 115)),
      );
      const box = this.add.graphics().lineStyle(4, 0x087f80, 0.6);
      box.strokeRoundedRect(w / 2 + 130, 215, 100, 110, 15);
      this.layer.add(box);
    } else if (this.id === "potty") {
      this.layer.add(this.art(w / 2, 280, step.hint!, 205));
      this.placed.forEach((c, i) =>
        this.layer.add(
          this.art(w / 2 - 150 + i * 100, 405, c.frame!, 80).setAlpha(0.7),
        ),
      );
    } else if (this.id === "breakfast") {
      this.placed.forEach((c, i) =>
        this.layer.add(this.art(w / 2 - 90 + i * 65, 345, c.frame!, 80)),
      );
      this.layer.add(
        this.art(w / 2 - 155, 180, step.hint!, 100).setAlpha(0.65),
      );
    }
    if (this.id === "ferris") {
      const target = step.choices.find((c) => c.id === step.correct[0])!;
      const cue = this.add.graphics();
      cue.fillStyle(0xffffff).fillCircle(85, 112, 36);
      cue.fillStyle(target.colour!).fillCircle(85, 112, 26);
      cue.lineStyle(3, 0x143657).strokeCircle(85, 112, 26);
      this.layer.add(cue);
    }
    if (announce) {
      this.say(promptText(step.clip), step.clip);
      this.emit();
    }
  }
  private renderMix() {
    const w = this.scale.width,
      g = this.add.graphics();
    g.lineStyle(6, 0x234955).strokeRoundedRect(w / 2 - 100, 155, 200, 215, 25);
    const chosen = this.chosen.map(
      (id) =>
        activities.science.steps[this.step].choices.find((c) => c.id === id)!
          .colour!,
    );
    activities.science.steps[this.step].correct.forEach((id, i) => {
      const colour = activities.science.steps[this.step].choices.find(
        (c) => c.id === id,
      )!.colour!;
      g.fillStyle(0xffffff).fillCircle(w / 2 - 45 + i * 90, 110, 31);
      g.fillStyle(colour).fillCircle(w / 2 - 45 + i * 90, 110, 24);
      g.lineStyle(3, 0x143657).strokeCircle(w / 2 - 45 + i * 90, 110, 24);
    });
    const result = [0xf5a64f, 0x69b685, 0x9c89c9][this.step];
    g.fillStyle(
      chosen.length === 2 ? result : chosen[0] || 0xe5f5f4,
    ).fillRoundedRect(w / 2 - 94, 240, 188, 124, 20);
    g.lineStyle(3, 0xffffff, 0.8);
    for (let y = 260; y < 350; y += 30)
      g.lineBetween(w / 2 + 60, y, w / 2 + 83, y);
    this.layer.add(g);
    for (let i = 0; i < chosen.length; i++)
      this.layer.add(this.add.circle(w / 2 - 40 + i * 80, 200, 24, chosen[i]));
  }
  private makeWheel() {
    const x = this.scale.width / 2,
      y = 265,
      r = 155;
    const g = this.add.graphics();
    g.lineStyle(18, 0x087f80)
      .lineBetween(x - 110, 460, x, y)
      .lineBetween(x + 110, 460, x, y);
    g.lineStyle(12, 0x143657).lineBetween(x - 130, 466, x + 130, 466);
    this.wheel = this.add.container(x, y);
    const spokes = this.add
      .graphics()
      .lineStyle(7, 0xedb746)
      .strokeCircle(0, 0, r);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      spokes.lineBetween(0, 0, Math.cos(a) * r, Math.sin(a) * r);
    }
    this.wheel.add(spokes);
    const colours = [0xef6c63, 0x4fafd4, 0xf4c54c];
    for (let i = 0; i < 6; i++) {
      const c = this.add.container(0, 0),
        shape = this.add.graphics();
      shape.fillStyle(colours[i % 3]).fillRoundedRect(-42, -12, 84, 65, 18);
      shape.lineStyle(4, 0x143657).strokeRoundedRect(-42, -12, 84, 65, 18);
      shape.fillStyle(0xfff9e6).fillRoundedRect(-28, -2, 56, 25, 9);
      c.add(shape)
        .setSize(94, 85)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => this.choose(["red", "blue", "yellow"][i % 3]));
      this.cabins.push(c);
    }
    this.add.circle(x, y, 18, 0x143657).setDepth(4);
    this.rides = this.add
      .text(x, 520, "", {
        fontFamily: "Arial",
        fontSize: "36px",
        color: "#143657",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.positionWheel();
  }
  private positionWheel() {
    const x = this.scale.width / 2,
      y = 265,
      r = 155;
    this.wheel?.setRotation(this.angle);
    this.cabins.forEach((c, i) =>
      c.setPosition(
        x + Math.cos(this.angle + (i * Math.PI) / 3) * r,
        y + Math.sin(this.angle + (i * Math.PI) / 3) * r,
      ),
    );
  }
  choose(id: string) {
    if (this.busy || this.finished) return;
    const step = activities[this.id].steps[this.step];
    if (!step.choices.some((c) => c.id === id)) return;
    if (!step.correct.includes(id)) {
      this.say("Let’s try again!", "try-again");
      this.boy.play("idle");
      this.emit();
      return;
    }
    if (this.chosen.includes(id)) return;
    this.chosen.push(id);
    if (this.id === "science") {
      this.layer.removeAll(true);
      this.renderMix();
      if (this.chosen.length < 2) {
        this.emit();
        return;
      }
    }
    this.busy = true;
    this.effect();
    this.boy.play("celebrate");
    if (this.bear) {
      if (id === "bowl" && !this.reduced) this.bear.play("benny-eat");
      else this.bear.setFrame(id === "water" ? 3 : id === "bowl" ? 2 : 1);
    }
    if (this.id === "ready" && id === "green" && this.trafficTruck) {
      if (this.reduced) this.trafficTruck.x = this.scale.width - 125;
      else
        this.tweens.add({
          targets: this.trafficTruck,
          x: this.scale.width - 125,
          duration: 1100,
          ease: "Sine.easeInOut",
        });
    }
    const celebrate = encouragementIds[this.step % encouragementIds.length];
    this.say(promptText(celebrate), celebrate);
    if (this.id === "ferris") {
      this.rides?.setText(
        Array.from({ length: this.step + 1 }, (_, i) => String(i + 1)).join(
          "   ",
        ),
      );
      if (this.reduced) {
        this.angle += Math.PI / 3;
        this.positionWheel();
      } else
        this.tweens.add({
          targets: this,
          angle: this.angle + Math.PI / 3,
          duration: 1100,
          ease: "Sine.easeInOut",
          onUpdate: () => this.positionWheel(),
        });
    } else if (
      this.id !== "science" &&
      this.id !== "ready" &&
      this.id !== "blocks"
    )
      this.placed.push(step.choices.find((c) => c.id === id)!);
    if (
      this.id === "railway" ||
      this.id === "builders" ||
      this.id === "potty" ||
      this.id === "breakfast"
    ) {
      const target = step.choices.find((c) => c.id === id)!;
      if (target.frame !== undefined) {
        const item = this.art(this.scale.width / 2, 405, target.frame, 100);
        this.layer.add(item);
        if (!this.reduced)
          this.tweens.add({
            targets: item,
            x:
              this.id === "railway"
                ? 120 + (this.placed.length - 1) * 145
                : this.id === "breakfast"
                  ? this.scale.width / 2 - 90 + (this.placed.length - 1) * 65
                  : this.scale.width / 2,
            y:
              this.id === "builders"
                ? 355 - (this.placed.length - 1) * 65
                : this.id === "railway"
                  ? 305
                  : this.id === "breakfast"
                    ? 345
                    : 280,
            scaleX: this.id === "railway" ? 165 / 256 : 100 / 256,
            scaleY: this.id === "railway" ? 165 / 256 : 100 / 256,
            duration: 650,
            ease: "Sine.easeOut",
          });
      }
    }
    this.emit();
    this.time.delayedCall(this.reduced ? 650 : 1500, () => {
      this.step++;
      this.busy = false;
      if (this.step >= activities[this.id].steps.length) {
        this.finished = true;
        this.step = activities[this.id].steps.length - 1;
        if (["builders", "railway", "breakfast"].includes(this.id))
          this.renderStep(false, false);
        this.say("You did it!", "you-did-it");
        this.emit();
      } else this.renderStep();
    });
  }
}
