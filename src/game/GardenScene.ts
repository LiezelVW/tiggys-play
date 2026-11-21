import * as Phaser from "phaser";
import { Character } from "./Character";
import { colours, rounds, matches, type Colour } from "./rules";
export class GardenScene extends Phaser.Scene {
  private boy!: Character;
  private round = 0;
  private score = 0;
  private selected: Phaser.GameObjects.Container | null = null;
  private objects: Phaser.GameObjects.Container[] = [];
  private baskets: Phaser.GameObjects.Container[] = [];
  private busy = false;
  constructor(
    private report: (score: number, round: number, finished: boolean) => void,
    private say: (text: string, clip: string) => void,
    private effect: (success: boolean) => void,
  ) {
    super("garden");
  }
  create() {
    this.input.dragDistanceThreshold = 12;
    const g = this.add.graphics();
    g.fillStyle(0xe9f3e7).fillRoundedRect(0, 0, 1000, 600, 30);
    g.fillStyle(0xf7d77b).fillCircle(851, 76, 41);
    g.fillStyle(0xffffff, 0.65);
    [
      [140, 73],
      [360, 40],
      [640, 85],
    ].forEach(([x, y]) => {
      g.fillEllipse(x, y, 130, 34);
      g.fillCircle(x - 25, y - 12, 25);
      g.fillCircle(x + 16, y - 18, 29);
    });
    g.fillStyle(0xc2d6a1).fillEllipse(220, 435, 950, 290);
    g.fillStyle(0xb3cbb0).fillEllipse(850, 420, 750, 250);
    g.fillStyle(0x8eae7c).fillRoundedRect(0, 439, 1000, 161, 0);
    for (let i = 0; i < 26; i++) {
      const x = (i * 173) % 1000,
        y = 460 + ((i * 37) % 130);
      g.lineStyle(2, 0x709765).lineBetween(x, y, x + 4, y - 13);
      g.fillStyle(i % 2 ? 0xfff2bc : 0xf7eee3).fillCircle(x + 4, y - 15, 4);
    }
    this.boy = new Character(this, 126, 310);
    this.add
      .text(126, 431, "Thiago", {
        fontFamily: "Arial",
        fontSize: "19px",
        color: "#35594e",
      })
      .setOrigin(0.5);
    colours.forEach((c, i) => {
      const b = this.add.container(360 + i * 230, 481);
      const art = this.add.graphics();
      art.fillStyle(c.hex, 0.25).fillRoundedRect(-85, -52, 170, 105, 18);
      art.lineStyle(5, c.hex).strokeRoundedRect(-85, -52, 170, 105, 18);
      art.lineBetween(-90, -31, 90, -31);
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
      const x = 360 + i * 230,
        y = 280;
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
      obj.setSize(112, 130).setInteractive({ useHandCursor: true });
      obj.setData({ colour: name, homeX: x, homeY: y });
      this.input.setDraggable(obj);
      obj.on("pointerdown", () => {
        if (this.busy) return;
        this.selected = obj;
        this.objects.forEach((o) => o.setScale(o === obj ? 1.13 : 1));
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
      duration: 250,
    });
    obj.setDepth(2);
    this.selected = null;
  }
  private place(obj: Phaser.GameObjects.Container, name: Colour) {
    if (this.busy || !obj.active) return;
    if (!matches(obj.getData("colour"), name)) {
      this.boy.play("think");
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
    this.say("Wonderful! You found a match.", "match");
    this.tweens.add({
      targets: obj,
      x: basket.x,
      y: basket.y - 15,
      scale: 0.5,
      alpha: 0,
      duration: 450,
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
