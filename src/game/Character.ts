import * as Phaser from "phaser";
export type CharacterState = "idle" | "wave" | "think" | "celebrate";
/** Temporary articulated human rig. Replace art while retaining animation API. */
export class Character {
  root: Phaser.GameObjects.Container;
  arm: Phaser.GameObjects.Container;
  eyes: Phaser.GameObjects.Container;
  private active: Phaser.Tweens.Tween[] = [];
  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    const s = scene;
    this.root = s.add.container(x, y);
    const ellipse = (x: number, y: number, w: number, h: number, c: number) =>
      s.add.ellipse(x, y, w, h, c);
    this.root.add(ellipse(0, 99, 100, 14, 0x000000).setAlpha(0.08));
    this.root.add([
      ellipse(-17, 68, 18, 48, 0xb77b56),
      ellipse(17, 68, 18, 48, 0xb77b56),
      ellipse(-22, 91, 34, 16, 0x39708f),
      ellipse(22, 91, 34, 16, 0x39708f),
      s.add.rectangle(0, 48, 60, 34, 0x558ead),
      ellipse(0, 15, 72, 78, 0xfff8e3),
      ellipse(-39, 26, 17, 50, 0xb77b56),
    ]);
    this.arm = s.add.container(36, -7);
    this.arm.add([
      ellipse(0, 17, 16, 42, 0xb77b56),
      ellipse(0, 39, 19, 20, 0xb77b56),
    ]);
    this.root.add(this.arm);
    this.root.add([
      s.add.star(0, 10, 5, 8, 18, 0x558ead),
      ellipse(0, -39, 91, 99, 0xc58a63),
      ellipse(-44, -38, 16, 21, 0xc58a63),
      ellipse(44, -38, 16, 21, 0xc58a63),
      ellipse(0, -77, 92, 41, 0x3d2b25),
      ellipse(-31, -64, 25, 42, 0x3d2b25),
    ]);
    this.eyes = s.add.container(0, -43);
    this.eyes.add([
      ellipse(-18, 0, 10, 14, 0x30251f),
      ellipse(18, 0, 10, 14, 0x30251f),
      ellipse(-16, -3, 3, 4, 0xffffff),
      ellipse(20, -3, 3, 4, 0xffffff),
    ]);
    this.root.add(this.eyes);
    this.root.add([
      ellipse(0, -18, 30, 16, 0x663c2c),
      s.add.rectangle(0, -22, 23, 5, 0xffffff),
    ]);
    this.root
      .setSize(110, 200)
      .setInteractive()
      .on("pointerdown", () => this.play("wave"));
    s.tweens.add({
      targets: this.root,
      scaleY: 1.025,
      duration: 1600,
      yoyo: true,
      repeat: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : -1,
    });
    s.time.addEvent({
      delay: 3800,
      loop: true,
      callback: () =>
        s.tweens.add({
          targets: this.eyes,
          scaleY: 0.08,
          duration: 90,
          yoyo: true,
        }),
    });
    this.play("wave");
  }
  play(state: CharacterState) {
    this.active.forEach((t) => t.stop());
    this.arm.setAngle(0);
    this.root.setAngle(0);
    if (state === "wave")
      this.active.push(
        this.scene.tweens.add({
          targets: this.arm,
          angle: -145,
          duration: 400,
          yoyo: true,
          repeat: 2,
        }),
      );
    if (state === "celebrate")
      this.active.push(
        this.scene.tweens.add({
          targets: this.root,
          angle: { from: -7, to: 7 },
          duration: 150,
          yoyo: true,
          repeat: 5,
        }),
      );
    if (state === "think")
      this.active.push(
        this.scene.tweens.add({
          targets: this.root,
          angle: 7,
          duration: 250,
          yoyo: true,
        }),
      );
  }
}
