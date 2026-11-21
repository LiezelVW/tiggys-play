import * as Phaser from "phaser";
import type { Colour } from "./rules";
/** Raster body and separately articulated treaded wheels, shared by selection and driving. */
export class TruckSprite {
  root: Phaser.GameObjects.Container;
  private wheels: Phaser.GameObjects.Container[] = [];
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    colour: Colour,
    scale = 1,
  ) {
    this.root = scene.add.container(x, y).setScale(scale);
    this.root.add(scene.add.ellipse(0, 61, 245, 17, 0x263848).setAlpha(0.15));
    this.root.add(
      scene.add.image(0, -20, `truck-${colour}`).setDisplaySize(260, 127),
    );
    [-73, 75].forEach((wx) => {
      const wheel = scene.add.container(wx, 35);
      const g = scene.add.graphics();
      g.fillStyle(0x15263c).fillCircle(0, 0, 45);
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6;
        g.fillStyle(0x27384d).fillRoundedRect(-6, -47, 12, 17, 3);
        const lug = scene.add
          .rectangle(Math.sin(a) * 38, Math.cos(a) * 38, 14, 20, 0x344459)
          .setRotation(-a);
        wheel.add(lug);
      }
      g.lineStyle(3, 0x4a5868).strokeCircle(0, 0, 34);
      g.fillStyle(0xf0ba3b).fillCircle(0, 0, 24);
      g.fillStyle(0xc78b23).fillCircle(0, 0, 14);
      g.fillStyle(0xffe89d).fillCircle(-5, -6, 5);
      wheel.add(g);
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5;
        wheel.add(
          scene.add.circle(Math.sin(a) * 15, Math.cos(a) * 15, 2.5, 0x25394d),
        );
      }
      this.root.add(wheel);
      this.wheels.push(wheel);
    });
  }
  rotate(distance: number) {
    this.wheels.forEach((w) => (w.rotation += distance / 45));
  }
  static preload(scene: Phaser.Scene) {
    scene.load.image("truck-red", "/assets/vehicles/truck-red.png");
    scene.load.image("truck-blue", "/assets/vehicles/truck-blue.png");
    scene.load.image("truck-yellow", "/assets/vehicles/truck-yellow.png");
  }
}
