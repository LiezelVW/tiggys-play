import { subscribeCharacterDialogue } from "./characterDialogue";
import * as Phaser from "phaser";
import { tiggyRig, rigAction, type TiggyState } from "./tiggyRig";
import { mountTiggyRig, type TiggyRenderer } from "./tiggyRiveRuntime";
/** Original author artwork; stays honestly static until a validated .riv is supplied. */
export class TiggySprite {
  private sprite: Phaser.GameObjects.Image;
  private renderer?: TiggyRenderer;
  private state: TiggyState = "wave";
  static preload(scene: Phaser.Scene) {
    scene.load.svg("tiggy-original", tiggyRig.neutral, {
      width: 320,
      height: 320,
    });
  }
  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    this.sprite = scene.add
      .image(x, y, "tiggy-original")
      .setDisplaySize(210, 210)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.play("wave"));
    const unsubscribe = subscribeCharacterDialogue((speaker, speaking) => {
      if (speaker !== "tiggy") return;
      if (speaking) this.play("talk");
      else if (!speaking && this.state === "talk") this.play("idle");
    });
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, unsubscribe);
    if (!tiggyRig.src) return;
    const abort = new AbortController();
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 320;
    const key = `tiggy-rive-${Phaser.Utils.String.UUID()}`;
    let texture: Phaser.Textures.CanvasTexture | null = null;
    const update = () => texture?.refresh();
    const pause = () => this.renderer?.pause();
    const resume = () => this.renderer?.resume();
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      abort.abort();
      this.renderer?.dispose();
      scene.events.off(Phaser.Scenes.Events.POST_UPDATE, update);
      scene.events.off(Phaser.Scenes.Events.PAUSE, pause);
      scene.events.off(Phaser.Scenes.Events.RESUME, resume);
      if (scene.textures.exists(key)) scene.textures.remove(key);
    });
    void mountTiggyRig(canvas, abort.signal)
      .then((renderer) => {
        if (!renderer || abort.signal.aborted) {
          renderer?.dispose();
          return;
        }
        this.renderer = renderer;
        texture = scene.textures.addCanvas(key, canvas);
        if (!texture) {
          renderer.dispose();
          return;
        }
        this.sprite.setTexture(key);
        scene.events.on(Phaser.Scenes.Events.POST_UPDATE, update);
        scene.events.on(Phaser.Scenes.Events.PAUSE, pause);
        scene.events.on(Phaser.Scenes.Events.RESUME, resume);
        renderer.trigger(rigAction(this.state));
        if (scene.scene.isPaused()) renderer.pause();
      })
      .catch((error) =>
        console.warn("Original Tiggy artwork retained:", error.message),
      );
  }
  play(state: TiggyState) {
    this.state = state;
    this.renderer?.trigger(rigAction(state));
  }
}
