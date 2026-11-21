import * as Phaser from "phaser";
import { tiggyAsset, type TiggyState } from "./tiggyAnimations";
export class TiggySprite {
  private sprite: Phaser.GameObjects.Sprite;
  static preload(scene: Phaser.Scene) {
    scene.load.spritesheet("tiggy", tiggyAsset.source, {
      frameWidth: tiggyAsset.frameWidth,
      frameHeight: tiggyAsset.frameHeight,
    });
  }
  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    for (const [state, frames] of Object.entries(tiggyAsset.states)) {
      const key = `tiggy-${state}`;
      if (!scene.anims.exists(key))
        scene.anims.create({
          key,
          frames: frames.map((frame) => ({ key: "tiggy", frame })),
          frameRate: state === "walk" ? 8 : 6,
          repeat: state === "walk" ? -1 : 0,
        });
    }
    this.sprite = scene.add
      .sprite(x, y, "tiggy")
      .setDisplaySize(210, 210)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.play("wave"));
    scene.time.addEvent({
      delay: 4500,
      loop: true,
      callback: () => {
        if (!this.sprite.anims.isPlaying) this.play("blink");
      },
    });
    this.play("wave");
  }
  play(state: TiggyState) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.sprite.setFrame(tiggyAsset.states[state][0]);
      return;
    }
    this.sprite.play(`tiggy-${state}`);
  }
}
