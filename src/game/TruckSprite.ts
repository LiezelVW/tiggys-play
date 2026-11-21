import * as Phaser from "phaser";
import type { Colour } from "./rules";
import { TRUCK_GEOMETRY, type TruckPose } from "./truckTrack";
/** Raster body and separately articulated treaded wheels, shared by selection and driving. */
export class TruckSprite {
  root: Phaser.GameObjects.Container;
  private shadow: Phaser.GameObjects.Ellipse;
  private wheels: Phaser.GameObjects.Container[] = [];
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    colour: Colour,
    scale = 1,
  ) {
    this.shadow = scene.add
      .ellipse(x, y + 80 * scale, 245 * scale, 17 * scale, 0x263848)
      .setAlpha(0.15)
      .setDepth(1);
    this.root = scene.add.container(x, y).setScale(scale).setDepth(2);
    this.root.add(
      scene.add.image(0, -20, `truck-${colour}`).setDisplaySize(260, 127),
    );
    [TRUCK_GEOMETRY.rearX, TRUCK_GEOMETRY.frontX].forEach((wx) => {
      const wheel = scene.add.container(wx, TRUCK_GEOMETRY.axleY);
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
    this.wheels.forEach(
      (w) =>
        (w.rotation += distance / (TRUCK_GEOMETRY.radius * this.root.scaleX)),
    );
  }
  groundShadow(y: number, lift = 0) {
    this.shadow
      .setPosition(this.root.x, y + 3)
      .setDisplaySize(
        (245 * this.root.scaleX) / (1 + lift / 150),
        17 * this.root.scaleX,
      )
      .setAlpha(0.15 / (1 + lift / 120));
  }
  applyPose(pose: TruckPose, groundY: number, lift = 0) {
    this.root.setPosition(pose.x, pose.y).setRotation(pose.rotation);
    this.groundShadow(groundY, lift);
  }
  setVisible(visible: boolean) {
    this.root.setVisible(visible);
    this.shadow.setVisible(visible);
  }
  destroy() {
    this.root.destroy();
    this.shadow.destroy();
  }
  static preload(scene: Phaser.Scene) {
    scene.load.image("truck-red", "/assets/vehicles/truck-red.png");
    scene.load.image("truck-blue", "/assets/vehicles/truck-blue.png");
    scene.load.image("truck-yellow", "/assets/vehicles/truck-yellow.png");
  }
}
