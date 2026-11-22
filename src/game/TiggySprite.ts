import * as Phaser from "phaser";
import { subscribeCharacterDialogue } from "./characterDialogue";
import { TiggyAnimator } from "./TiggyAnimator";
import { characterAction, type TiggyState } from "./tiggyActions";
/** Same original-path puppet and keyframes as the home character, rendered inside Phaser. */
export class TiggySprite {
  private animator: TiggyAnimator;
  private sprite: Phaser.GameObjects.Image;
  static preload(_scene: Phaser.Scene) {
    /* Original vector paths are compiled locally; no missing export. */
  }
  constructor(scene: Phaser.Scene, x: number, y: number) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 420;
    this.animator = new TiggyAnimator(canvas);
    const key = `tiggy-vector-${Phaser.Utils.String.UUID()}`,
      texture = scene.textures.addCanvas(key, canvas)!;
    this.sprite = scene.add
      .image(x, y, key)
      .setDisplaySize(240, 240)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.play("wave"));
    const update = (_time: number, delta: number) => {
      this.animator.update(delta / 1000);
      texture.refresh();
      scene.game.canvas.dataset.tiggyAction = this.animator.action;
      scene.game.canvas.dataset.tiggyFrame = canvas.dataset.frame;
    };
    const unsubscribe = subscribeCharacterDialogue((speaker, speaking) => {
      if (speaker === "tiggy") this.animator.setSpeaking(speaking);
    });
    scene.events.on(Phaser.Scenes.Events.UPDATE, update);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      unsubscribe();
      scene.events.off(Phaser.Scenes.Events.UPDATE, update);
      if (scene.textures.exists(key)) scene.textures.remove(key);
    });
    this.play("wave");
  }
  play(state: TiggyState) {
    this.animator.play(characterAction(state));
  }
  moveTo(x: number, y: number, duration = 1000, arrival: TiggyState = "happy") {
    this.play("walk");
    const scene = this.sprite.scene;
    scene.tweens.add({
      targets: this.sprite,
      x,
      y,
      duration,
      onComplete: () => this.play(arrival),
    });
  }
}
