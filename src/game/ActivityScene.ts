import * as Phaser from "phaser";
import { activities, type ActivityId, type Choice } from "./activities";
import { promptText } from "./voicePrompts";
import { TiggySprite } from "./TiggySprite";
import { gentleEffect, speak } from "./audio";
export type ActivityStatus = {
  step: number;
  finished: boolean;
  busy: boolean;
  selected: string[];
  waiting?: boolean;
};
type Target = { x: number; y: number; id: string; radius: number };
export class ActivityScene extends Phaser.Scene {
  private step = 0;
  private busy = false;
  private finished = false;
  private waiting = false;
  private chosen: string[] = [];
  private layer!: Phaser.GameObjects.Container;
  private boy!: TiggySprite;
  private bear?: Phaser.GameObjects.Sprite;
  private roadVehicle?: Phaser.GameObjects.Container;
  private cabins: Phaser.GameObjects.Container[] = [];
  private wheel?: Phaser.GameObjects.Container;
  private angle = 0;
  private placed: Choice[] = [];
  private targets: Target[] = [];
  private sources: Phaser.GameObjects.Container[] = [];
  private selected?: Phaser.GameObjects.Container;
  private reduced = false;
  private wheelRiders = new Map<number, number>();
  constructor(
    private id: ActivityId,
    private report: (s: ActivityStatus) => void,
    private say: (
      text: string,
      clip: string,
      speaker?: "tiggy" | "benny",
    ) => void,
    private effect: () => void,
    private level = 0,
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
    g.fillStyle(
      this.id === "breakfast" || this.id === "potty" ? 0xfff1d7 : 0xd9f1ed,
    ).fillRoundedRect(0, 0, w, h, 24);
    g.fillStyle(0xb5d8b4).fillEllipse(w / 2, h + 110, w * 1.7, 480);
    if (["breakfast", "potty"].includes(this.id)) {
      g.fillStyle(0xd9e9e2).fillRoundedRect(24, 30, w - 48, 335, 25);
      g.lineStyle(3, 0xffffff, 0.8);
      for (let x = 50; x < w; x += 75) g.lineBetween(x, 30, x, 350);
      g.fillStyle(0xb78257).fillRoundedRect(w / 2 - 180, 335, 360, 28, 12);
    } else {
      g.fillStyle(0xffffff, 0.8)
        .fillRoundedRect(35, 45, 150, 42, 24)
        .fillRoundedRect(w - 210, 65, 145, 40, 25);
    }
    this.boy = new TiggySprite(this, w - 85, 142);
    this.layer = this.add.container(0, 0);
    if (this.id === "breakfast")
      this.bear = this.add
        .sprite(w / 2, 215, "activity-art", 0)
        .setDisplaySize(240, 240);
    if (this.id === "ferris") this.makeWheel();
    this.input.dragDistanceThreshold = 6;
    this.input.on(
      "drag",
      (
        _p: Phaser.Input.Pointer,
        obj: Phaser.GameObjects.Container,
        x: number,
        y: number,
      ) => {
        if (this.busy) return;
        obj.setPosition(x, y).setDepth(30);
        this.selected = obj;
        if (this.bear && this.step === 2)
          this.bear.setFrame(
            Phaser.Math.Distance.Between(x, y, this.scale.width / 2, 225) < 150
              ? 2
              : 0,
          );
      },
    );
    this.input.on(
      "dragend",
      (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container) =>
        this.drop(obj),
    );
    this.renderStep();
  }
  private emit() {
    this.report({
      step: this.step,
      finished: this.finished,
      busy: this.busy,
      selected: [...this.chosen],
      waiting: this.waiting,
    });
    this.game.canvas.dataset.activityStep = String(this.step);
  }
  private art(x: number, y: number, frame: number, size = 110) {
    return this.add
      .image(x, y, "activity-art", frame)
      .setDisplaySize(size, size);
  }
  private target(
    x: number,
    y: number,
    id: string,
    radius = 85,
    frame?: number,
  ) {
    this.targets.push({ x, y, id, radius });
    const ring = this.add.graphics().lineStyle(4, 0x258d8c, 0.65);
    ring.strokeRoundedRect(x - radius, y - radius, radius * 2, radius * 2, 24);
    this.layer.add(ring);
    if (frame !== undefined)
      this.layer.add(this.art(x, y, frame, 125).setAlpha(0.28));
    const zone = this.add.zone(x, y, radius * 2, radius * 2).setInteractive();
    zone.on("pointerdown", () => {
      if (this.selected) this.drop(this.selected, { x, y, id, radius });
    });
    this.layer.add(zone);
    if (this.step === 0 && !this.reduced)
      this.tweens.add({
        targets: ring,
        alpha: 0.3,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });
  }
  private renderStep() {
    this.layer.removeAll(true);
    this.targets = [];
    this.sources = [];
    this.selected = undefined;
    this.chosen = [];
    const w = this.scale.width,
      step = activities[this.id].steps[this.step];
    if (this.id === "ferris") {
      this.cabins.forEach((c, i) =>
        this.targets.push({
          x: c.x,
          y: c.y + 18,
          id: ["red", "blue", "yellow"][i % 3],
          radius: 65,
        }),
      );
    } else if (this.id === "railway") {
      const rail = this.add.graphics().lineStyle(5, 0x426363);
      rail.lineBetween(35, 318, w - 35, 318).lineBetween(35, 333, w - 35, 333);
      for (let x = 40; x < w; x += 24) rail.lineBetween(x, 312, x, 342);
      this.layer.add(rail);
      this.placed.forEach((p, i) =>
        this.layer.add(this.trainCar(115 + i * 140, 265, p.frame!, false)),
      );
      this.target(115 + this.placed.length * 140, 265, "dock", 70, step.hint);
    } else if (this.id === "builders") {
      this.layer.add(this.art(90, 295, 19, 150));
      this.placed.forEach((p, i) =>
        this.layer.add(this.art(w / 2, 320 - i * 67, p.frame!, 110)),
      );
      this.target(
        w / 2,
        320 - this.placed.length * 67,
        "build",
        70,
        this.level === 0 ? step.hint : undefined,
      );
    } else if (this.id === "science") {
      const g = this.add.graphics().lineStyle(6, 0x234955);
      g.strokeRoundedRect(w / 2 - 88, 160, 176, 200, 25);
      g.fillStyle(0xc7e8e6).fillRoundedRect(w / 2 - 82, 238, 164, 116, 18);
      this.layer.add(g);
      this.target(w / 2, 255, "mix", 90);
      if (!this.level)
        step.correct.forEach((id, i) => {
          const colour = step.choices.find((c) => c.id === id)!.colour!;
          this.layer.add(this.add.circle(w / 2 - 42 + i * 84, 110, 25, colour));
        });
    } else if (this.id === "blocks") {
      const pattern = Array.from(
          { length: 3 + this.step * 2 },
          (_, i) => step.pattern![i % 2],
        ),
        unit = Math.min(84, (w - 90) / (pattern.length + 1));
      pattern.forEach((f, i) =>
        this.layer.add(
          this.art(
            w / 2 - (pattern.length / 2) * unit + i * unit,
            255,
            f,
            unit - 8,
          ),
        ),
      );
      this.target(
        w / 2 + (pattern.length / 2) * unit,
        255,
        "pattern",
        unit * 0.5,
      );
    } else if (this.id === "ready") {
      const g = this.add.graphics().fillStyle(0x173c50);
      g.fillRoundedRect(w / 2 - 45, 85, 90, 230, 25);
      [0xef6c63, 0xf4c54c, 0x4baa85].forEach((c, i) =>
        g
          .fillStyle(c, i === this.step ? 1 : 0.22)
          .fillCircle(w / 2, 125 + i * 70, 26),
      );
      this.layer.add(g);
      this.target(w / 2, 125 + this.step * 70, "light", 65);
      this.roadVehicle = this.trainCar(100, 300, -1, false);
      this.layer.add(this.roadVehicle);
    } else if (this.id === "breakfast") {
      const feeding = this.step === 2 || this.step === 3 || this.step === 4;
      if (this.step > 0 && this.step < 5)
        this.layer.add(this.art(w / 2 - 140, 310, 4, 100));
      this.target(
        feeding ? w / 2 : w / 2 - 140,
        feeding ? 225 : 300,
        "routine",
        75,
        feeding ? undefined : step.hint,
      );
      if (this.step === 1)
        this.layer.add(this.art(w / 2 + 140, 300, 5, 95).setAlpha(0.3));
      this.bear?.setFrame(0);
    } else if (this.id === "potty") {
      this.layer.add(this.art(w / 2, 255, step.hint!, 185));
      this.target(w / 2, 255, "routine", 95);
      if (this.step === 2) this.boy.play("walk");
      if (this.step === 4) this.boy.moveTo(w / 2 + 20, 160, 500, "sit");
    }
    // First visit offers three large choices; later visits add less scaffolding and reorder them.
    const choices = this.level ? [...step.choices].reverse() : step.choices;
    choices.forEach((choice, i) => {
      const x = w / 2 + (i - (choices.length - 1) / 2) * 150,
        y = 455,
        card = this.add.container(x, y);
      const bg = this.add
        .graphics()
        .fillStyle(0xffffff)
        .fillRoundedRect(-65, -62, 130, 124, 24)
        .lineStyle(3, 0xb7d8ce)
        .strokeRoundedRect(-65, -62, 130, 124, 24);
      card.add(bg);
      if (this.id === "ferris") {
        card.add(this.add.circle(0, 0, 46, choice.colour!));
        card.add(this.art(0, -4, i % 2 === 0 ? 0 : 1, 90));
        card.add(
          this.add
            .circle(28, 27, 13, choice.colour!)
            .setStrokeStyle(3, 0xffffff),
        );
      } else if (choice.frame !== undefined)
        card.add(this.art(0, 0, choice.frame, 106));
      else
        card.add(
          this.add.circle(0, 0, 39, choice.colour!).setStrokeStyle(3, 0x285057),
        );
      if (this.id === "breakfast" && choice.id === "spoon" && this.step === 2)
        card.add(this.add.circle(10, -15, 12, 0xd9ab66));
      if (this.id === "breakfast" && this.step === 2 && choice.id === "spoon") {
        card.setPosition(w / 2 - 140, 310);
        bg.setAlpha(0);
      }
      card.setSize(140, 135).setInteractive({ useHandCursor: true });
      card.setData({ choice, homeX: card.x, homeY: card.y });
      card.on("pointerdown", () => {
        if (!this.busy) {
          this.selected = card;
          this.sources.forEach((c) => c.setScale(c === card ? 1.08 : 1));
        }
      });
      this.input.setDraggable(card);
      this.layer.add(card);
      this.sources.push(card);
    });
    this.say(promptText(step.clip), step.clip);
    this.emit();
  }
  private returnHome(obj: Phaser.GameObjects.Container) {
    obj.setScale(1).setDepth(0);
    (obj.first as Phaser.GameObjects.Graphics).setAlpha(1);
    this.tweens.add({
      targets: obj,
      x: obj.getData("homeX"),
      y: obj.getData("homeY"),
      duration: this.reduced ? 0 : 280,
      ease: "Sine.easeOut",
    });
    this.selected = undefined;
  }
  private drop(obj: Phaser.GameObjects.Container, explicit?: Target) {
    if (this.busy || this.finished || this.waiting || !obj.active) return;
    const choice = obj.getData("choice") as Choice,
      target =
        explicit ||
        this.targets.find(
          (t) =>
            Phaser.Math.Distance.Between(t.x, t.y, obj.x, obj.y) <
            t.radius + 24,
        );
    const step = activities[this.id].steps[this.step];
    if (!target) {
      this.returnHome(obj);
      return;
    }
    if (
      !step.correct.includes(choice.id) ||
      (this.id === "ferris" && target.id !== choice.id)
    ) {
      this.boy.play("help");
      this.say("Let’s try again!", "try-again");
      this.bear?.setFrame(0);
      this.returnHome(obj);
      return;
    }
    if (this.chosen.includes(choice.id)) {
      this.returnHome(obj);
      return;
    }
    this.chosen.push(choice.id);
    (obj.first as Phaser.GameObjects.Graphics).setAlpha(0);
    this.busy = true;
    obj.disableInteractive();
    this.selected = undefined;
    this.tweens.add({
      targets: obj,
      x: target.x,
      y: target.y,
      scaleX: 0.7,
      scaleY: 0.7,
      duration: this.reduced ? 0 : 320,
      ease: "Sine.easeOut",
    });
    if (this.id === "science" && this.chosen.length < 2) {
      this.layer.add(
        this.add.circle(this.scale.width / 2 - 35, 275, 30, choice.colour!),
      );
      this.time.delayedCall(350, () => {
        obj.setVisible(false);
        this.busy = false;
        this.emit();
      });
      this.emit();
      return;
    }
    this.boy.play(this.id === "ferris" ? "clap" : "celebrate");
    this.effect();
    const praise =
      this.id === "ferris"
        ? "well-done"
        : ["well-done", "you-did-it", "yay"][this.step % 3];
    if (this.id !== "breakfast") this.say(promptText(praise), praise);
    let wait = 1500;
    if (this.id === "ferris") {
      const index = this.cabins.findIndex(
        (c) =>
          Math.abs(c.x - target.x) < 1 && Math.abs(c.y + 18 - target.y) < 1,
      );
      if (index >= 0) {
        this.cabins[index].add(this.art(0, 9, 0, 46));
        this.wheelRiders.set(index, this.step);
      }
      this.time.delayedCall(330, () => obj.setVisible(false));
      this.targets = [];
      this.tweens.add({
        targets: this,
        angle: this.angle + Math.PI / 3,
        duration: this.reduced ? 0 : 1200,
        ease: "Sine.easeInOut",
        onUpdate: () => this.positionWheel(),
      });
      gentleEffect("clap");
    } else if (this.id === "railway") {
      this.placed.push(choice);
      gentleEffect("connect");
      if (this.step === activities.railway.steps.length - 1) {
        wait = 3000;
        this.time.delayedCall(350, () => {
          obj.setVisible(false);
          this.layer.removeAll(true);
          const train = this.add.container(0, 0);
          this.placed.forEach((p, i) =>
            train.add(this.trainCar(115 + i * 140, 265, p.frame!, true)),
          );
          this.layer.add(train);
          gentleEffect("whistle");
          this.boy.play("walk");
          this.tweens.add({
            targets: train,
            x: this.scale.width + 350,
            duration: this.reduced ? 0 : 2200,
            ease: "Sine.easeIn",
          });
        });
      }
    } else if (this.id === "science") {
      this.time.delayedCall(320, () => {
        obj.setVisible(false);
        const colours = [0xf5a64f, 0x69b685, 0x9c89c9],
          g = this.add.graphics().fillStyle(colours[this.step]);
        g.fillRoundedRect(this.scale.width / 2 - 82, 238, 164, 116, 18);
        this.layer.add(g);
        for (let i = 0; i < 7; i++) {
          const b = this.add.circle(
            this.scale.width / 2 - 55 + Math.random() * 110,
            315,
            5 + Math.random() * 9,
            0xffffff,
            0.75,
          );
          this.layer.add(b);
          this.tweens.add({
            targets: b,
            y: 170,
            alpha: 0,
            duration: this.reduced ? 0 : 800 + i * 50,
          });
        }
      });
      gentleEffect("water");
    } else if (this.id === "ready" && choice.id === "green") {
      this.roadVehicle?.destroy();
      const car = this.trainCar(100, 300, -1, true);
      this.layer.add(car);
      this.tweens.add({
        targets: car,
        x: this.scale.width + 100,
        duration: this.reduced ? 0 : 1200,
      });
    } else if (this.id === "builders") this.placed.push(choice);
    else if (this.id === "breakfast") {
      gentleEffect(
        this.step === 4 ? "water" : this.step === 3 ? "wipe" : "spoon",
      );
      if (this.step === 3 && !this.reduced)
        this.tweens.add({
          targets: obj,
          x: this.scale.width / 2 + 30,
          yoyo: true,
          repeat: 3,
          duration: 170,
          delay: 320,
        });
      if (this.step === 4 && !this.reduced)
        this.tweens.add({
          targets: obj,
          angle: -25,
          duration: 400,
          delay: 320,
        });
      if (this.step === 2) {
        wait = 2200;
        this.bear?.setFrame(2);
        this.tweens.add({ targets: obj, alpha: 0, duration: 180, delay: 500 });
        let bite = 0;
        const chew = this.time.addEvent({
          delay: 220,
          repeat: 5,
          callback: () => {
            this.bear?.setFrame([2, 0, 3, 0][bite++ % 4]);
          },
        });
        this.time.delayedCall(1550, () => {
          chew.remove();
          this.bear?.setFrame(1);
          this.say(promptText("breakfast-your-turn"), "your-turn", "tiggy");
          this.waiting = true;
          this.busy = false;
          this.emit();
        });
        this.emit();
        return;
      }
      this.bear?.setFrame(this.step === 4 ? 3 : 1);
    } else if (this.id === "potty") {
      if (this.step === 2)
        this.boy.moveTo(this.scale.width / 2 + 100, 175, 1000);
      if ([5, 6].includes(this.step)) gentleEffect("water");
      if (this.step === 1) speak("Help me, please!", "help-please");
    }
    this.emit();
    this.time.delayedCall(wait, () => this.advance());
  }
  requestHelp() {
    this.boy.play("help");
  }
  continueRoutine() {
    if (!this.waiting) return;
    this.waiting = false;
    this.advance();
  }
  more() {
    if (this.id !== "breakfast" || this.busy || this.step < 2) return;
    this.waiting = false;
    this.finished = false;
    this.step = 1;
    this.placed = [];
    this.renderStep();
  }
  private advance() {
    this.step++;
    this.busy = false;
    if (this.step >= activities[this.id].steps.length) {
      this.step = activities[this.id].steps.length - 1;
      this.finished = true;
      this.boy.play("happy");
      this.say("You did it!", "you-did-it");
      this.emit();
    } else this.renderStep();
  }
  choose(id: string) {
    const source = this.sources.find(
      (c) => (c.getData("choice") as Choice).id === id,
    );
    if (!source) return;
    const target =
      this.id === "ferris"
        ? this.targets.find((t) => t.id === id)
        : this.targets[0];
    if (target) this.drop(source, target);
  }
  private trainCar(x: number, y: number, frame: number, moving: boolean) {
    const car = this.add.container(x, y);
    if (frame < 0)
      car.add(
        this.add.image(0, -12, "activity-truck").setDisplaySize(210, 103),
      );
    else car.add(this.art(0, 0, frame, 155));
    for (const offset of frame < 0 ? [-70, 70] : [-43, 43]) {
      const wheel = this.add.container(offset, 35),
        g = this.add
          .graphics()
          .fillStyle(0x163650)
          .fillCircle(0, 0, frame < 0 ? 29 : 14)
          .lineStyle(3, 0xfff4cd);
      g.lineBetween(-9, 0, 9, 0).lineBetween(0, -9, 0, 9);
      wheel.add(g);
      car.add(wheel);
      if (moving && !this.reduced)
        this.tweens.add({
          targets: wheel,
          angle: 720,
          duration: 2000,
          repeat: -1,
        });
    }
    return car;
  }
  private makeWheel() {
    const x = this.scale.width / 2,
      y = 220,
      r = 125,
      g = this.add.graphics().lineStyle(15, 0x087f80);
    g.lineBetween(x - 95, 370, x, y).lineBetween(x + 95, 370, x, y);
    g.lineStyle(10, 0x143657).lineBetween(x - 110, 376, x + 110, 376);
    this.wheel = this.add.container(x, y);
    const spokes = this.add
      .graphics()
      .lineStyle(6, 0xedb746)
      .strokeCircle(0, 0, r);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      spokes.lineBetween(0, 0, Math.cos(a) * r, Math.sin(a) * r);
    }
    this.wheel.add(spokes);
    for (let i = 0; i < 6; i++) {
      const c = this.add.container(0, 0),
        shape = this.add
          .graphics()
          .fillStyle([0xef6c63, 0x4fafd4, 0xf4c54c][i % 3])
          .fillRoundedRect(-36, -8, 72, 57, 15)
          .lineStyle(3, 0x143657)
          .strokeRoundedRect(-36, -8, 72, 57, 15);
      shape.fillStyle(0xfff9e6).fillRoundedRect(-24, -1, 48, 21, 6);
      c.add(shape).setSize(110, 90).setInteractive();
      c.on("pointerdown", () => {
        if (this.selected)
          this.drop(this.selected, {
            x: c.x,
            y: c.y + 18,
            id: ["red", "blue", "yellow"][i % 3],
            radius: 65,
          });
      });
      this.cabins.push(c);
    }
    this.add.circle(x, y, 15, 0x143657);
    this.positionWheel();
  }
  private positionWheel() {
    this.wheel?.setRotation(this.angle);
    this.cabins.forEach((c, i) =>
      c.setPosition(
        this.scale.width / 2 + Math.cos(this.angle + (i * Math.PI) / 3) * 125,
        220 + Math.sin(this.angle + (i * Math.PI) / 3) * 125,
      ),
    );
  }
}
