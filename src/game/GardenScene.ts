import { celebrationLine } from "./voiceCandidates";
import { promptText } from "./voicePrompts";
import * as Phaser from "phaser";
import { TiggySprite } from "./TiggySprite";
import { colours, rounds, matches, type Colour } from "./rules";
export class GardenScene extends Phaser.Scene {
  private boy!: TiggySprite;
  private round = 0;
  private score = 0;
  private selected: Phaser.GameObjects.Container | null = null;
  private objects: Phaser.GameObjects.Container[] = [];
  private baskets: Phaser.GameObjects.Container[] = [];
  private busy = false;
  private portrait = false;
  private positions = [360, 590, 820];
  private basketY = 481;
  private flowerY = 280;
  constructor(
    private report: (score: number, round: number, finished: boolean) => void,
    private say: (text: string, clip: string) => void,
    private effect: (success: boolean) => void,
  ) {
    super("garden");
  }
  preload() {
    TiggySprite.preload(this);
    this.load.image("garden-art", "/assets/world/colour-garden-flat.webp");
  }
  create() {
    this.portrait = this.scale.width === 600;
    if (this.portrait) {
      this.positions = [145, 300, 455];
      this.basketY = 530;
      this.flowerY = 225;
    }
    this.input.dragDistanceThreshold = 12;
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, "garden-art")
      .setDisplaySize(1000, 667);
    this.boy = new TiggySprite(
      this,
      this.portrait ? 75 : 126,
      this.portrait ? 375 : 310,
    );
    colours.forEach((c, i) => {
      const b = this.add.container(this.positions[i], this.basketY);
      const art = this.add.graphics();
      const outline = [
        { x: -77, y: -40 },
        { x: 77, y: -40 },
        { x: 62, y: 50 },
        { x: -62, y: 50 },
      ];
      art.fillStyle(c.hex).fillPoints(outline, true);
      art.lineStyle(4, 0x3e5260).strokePoints(outline, true);
      art.lineStyle(2, 0xfff7dd, 0.5);
      for (let row = -15; row < 45; row += 17)
        art.lineBetween(-65, row, 65, row);
      for (let col = -45; col < 60; col += 23)
        art.lineBetween(col, -31, col, 44);
      art.fillStyle(c.hex).fillRoundedRect(-88, -51, 176, 24, 8);
      art.lineStyle(4, 0x3e5260).strokeRoundedRect(-88, -51, 176, 24, 8);
      b.add(art);
      b.add(
        this.add
          .text(0, 17, c.label, {
            fontFamily: "Arial",
            fontSize: "24px",
            fontStyle: "bold",
            color: "#463b2e",
          })
          .setOrigin(0.5),
      );
      b.setSize(180, 116)
        .setInteractive()
        .on("pointerdown", () => {
          if (this.selected) this.place(this.selected, c.name);
        });
      b.setData("colour", c.name);
      this.baskets.push(b);
    });
    this.input.on(
      "drag",
      (
        _p: Phaser.Input.Pointer,
        obj: Phaser.GameObjects.Container,
        x: number,
        y: number,
      ) => {
        if (!this.busy) {
          obj.setPosition(x, y);
          obj.setDepth(10);
        }
      },
    );
    this.input.on(
      "dragend",
      (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container) => {
        if (this.busy) return;
        const basket = this.baskets.find(
          (b) => Math.abs(b.x - obj.x) < 100 && Math.abs(b.y - obj.y) < 85,
        );
        if (basket) this.place(obj, basket.getData("colour"));
        else this.reset(obj);
      },
    );
    this.loadRound();
  }
  private loadRound() {
    this.objects.forEach((o) => o.destroy());
    this.objects = [];
    rounds[this.round].forEach((name, i) => {
      const c = colours.find((c) => c.name === name)!;
      const x = this.positions[i],
        y = this.flowerY;
      const obj = this.add.container(x, y);
      const flower = this.add.graphics();
      flower.lineStyle(7, 0x658e60).lineBetween(0, 0, 0, 65);
      flower.fillStyle(0x82a768).fillEllipse(16, 40, 30, 14);
      for (let p = 0; p < 6; p++) {
        const a = (p * Math.PI) / 3;
        flower
          .fillStyle(c.hex)
          .fillCircle(Math.cos(a) * 24, Math.sin(a) * 24, 21);
      }
      flower.fillStyle(0xffefbc).fillCircle(0, 0, 19);
      flower.fillStyle(0x554536).fillCircle(-6, -2, 2.5).fillCircle(6, -2, 2.5);
      flower
        .lineStyle(2, 0x554536)
        .beginPath()
        .arc(0, 1, 7, 0, Math.PI)
        .strokePath();
      obj.add(flower);
      obj.setSize(150, 160).setInteractive({ useHandCursor: true });
      obj.setData({ colour: name, homeX: x, homeY: y });
      this.input.setDraggable(obj);
      obj.on("pointerdown", () => {
        if (this.busy) return;
        this.selected = obj;
        this.objects.forEach((o) => o.setScale(o === obj ? 1.13 : 1));
        this.boy.play("talk");
        this.say(`Put the ${name} flower in the ${name} basket.`, name);
      });
      this.objects.push(obj);
    });
    this.busy = false;
    this.selected = null;
    this.report(this.score, this.round + 1, false);
    this.say("Let’s match the flowers to their colour baskets.", "intro");
  }
  private reset(obj: Phaser.GameObjects.Container) {
    this.tweens.add({
      targets: obj,
      x: obj.getData("homeX"),
      y: obj.getData("homeY"),
      scale: 1,
      duration: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : 250,
    });
    obj.setDepth(2);
    this.selected = null;
  }
  private place(obj: Phaser.GameObjects.Container, name: Colour) {
    if (this.busy || !obj.active) return;
    if (!matches(obj.getData("colour"), name)) {
      this.boy.play("idle");
      this.say("Let’s try another basket. You can do it!", "retry");
      this.reset(obj);
      return;
    }
    this.busy = true;
    obj.disableInteractive();
    this.selected = null;
    const basket = this.baskets.find((b) => b.getData("colour") === name)!;
    this.effect(true);
    this.boy.play("celebrate");
    const praise = celebrationLine(this.score, "match");
    this.say(promptText(praise), praise);
    this.tweens.add({
      targets: obj,
      x: basket.x,
      y: basket.y - 15,
      scale: 0.5,
      alpha: 0,
      duration: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : 450,
      onComplete: () => {
        obj.destroy();
        this.score++;
        this.report(this.score, this.round + 1, this.score === 9);
        if (this.score === 9) {
          this.say("You did it! What a beautiful garden!", "complete");
          return;
        }
        if (this.score % 3 === 0) {
          this.round++;
          this.time.delayedCall(900, () => this.loadRound());
        } else this.busy = false;
      },
    });
  }
  /** Keyboard and assistive controls share the same scoring path as drag input. */
  accessibleMatch(colour: Colour) {
    if (this.busy) return;
    const obj = this.objects.find(
      (o) => o.active && o.getData("colour") === colour,
    );
    if (obj) this.place(obj, colour);
  }
}
