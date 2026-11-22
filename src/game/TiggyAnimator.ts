import layers from "./tiggyLayers.json";
import {
  actionDuration,
  characterPose,
  type CharacterAction,
} from "./tiggyPose";
type Part = { part?: string; d: string; fill: string; matrix: number[] };
/** Hierarchical 2D vector puppetry: original paths, shoulder/elbow/wrist and hip/knee pivots. */
export class TiggyAnimator {
  action: CharacterAction = "Idle";
  elapsed = 0;
  speaking = false;
  private clock = 0;
  private paths = new Map<string, Path2D>();
  private context: CanvasRenderingContext2D;
  constructor(readonly canvas: HTMLCanvasElement) {
    this.context = canvas.getContext("2d")!;
    for (const p of [
      ...layers.parts,
      ...layers.expressions.thinking,
      ...layers.expressions.laughing,
      ...layers.expressions.closedLeft,
      ...layers.expressions.closedRight,
    ])
      this.paths.set(p.d, new Path2D(p.d));
    this.draw();
  }
  play(action: CharacterAction) {
    this.action = action;
    this.elapsed = 0;
    this.draw();
  }
  setSpeaking(value: boolean) {
    this.speaking = value;
    this.draw();
  }
  update(dt: number) {
    this.elapsed += Math.min(dt, 0.05);
    this.clock += Math.min(dt, 0.05);
    const duration = actionDuration[this.action];
    if (duration && this.elapsed >= duration) {
      this.action = "Idle";
      this.elapsed = 0;
    }
    this.draw();
  }
  private rotate(x: number, y: number, angle: number) {
    const c = this.context;
    c.translate(x, y);
    c.rotate(angle);
    c.translate(-x, -y);
  }
  draw() {
    const c = this.context,
      reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const p = characterPose(
      this.action,
      this.action === "Idle" ? this.clock : this.elapsed,
      reduced,
    );
    if (this.speaking && !reduced)
      p.mouth = 0.35 + 0.9 * Math.abs(Math.sin(this.clock * 11));
    c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    c.save();
    // Extra transparent bounds allow raised hands and jumping without cropping.
    const scale = Math.min(this.canvas.width / 2200, this.canvas.height / 3000);
    c.translate(this.canvas.width / 2, this.canvas.height * 0.94);
    c.scale(scale, scale);
    c.translate(-2080, -2642);
    c.translate(0, p.lift);
    this.rotate(2080, 2090, p.lean);
    const headParts = new Set([
      "head_upper",
      "head_lower",
      "left_ear",
      "right_ear",
      "hair",
      "left_eye",
      "right_eye",
      "left_brow",
      "right_brow",
      "nose_upper",
      "nose_lower",
      "left_ear_inner",
      "mouth_neutral",
    ]);
    const joint = (name: string) => {
      if (headParts.has(name)) this.rotate(2080, 1340, p.head);
      if (name.startsWith("left_") && /arm|forearm|hand|sleeve/.test(name)) {
        this.rotate(1840, 1415, p.leftArm);
        if (/forearm|hand/.test(name)) this.rotate(1760, 1720, p.leftElbow);
        if (/hand/.test(name)) this.rotate(1750, 2010, p.leftWrist);
      }
      if (name.startsWith("right_") && /arm|forearm|hand|sleeve/.test(name)) {
        this.rotate(2270, 1415, p.rightArm);
        if (/forearm|hand/.test(name)) this.rotate(2390, 1700, p.rightElbow);
        if (/hand/.test(name)) this.rotate(2430, 1980, p.rightWrist);
      }
      if (/left_(thigh|shin|foot)/.test(name)) {
        this.rotate(1960, 2130, p.leftHip);
        if (name !== "left_thigh") this.rotate(1950, 2280, p.leftKnee);
        if (name === "left_foot") this.rotate(1950, 2500, p.leftAnkle);
      }
      if (/right_(thigh|shin|foot)/.test(name)) {
        this.rotate(2200, 2130, p.rightHip);
        if (name !== "right_thigh") this.rotate(2220, 2280, p.rightKnee);
        if (name === "right_foot") this.rotate(2230, 2500, p.rightAnkle);
      }
      if (["neck", "shirt_and_sleeves_unsplit"].includes(name)) {
        c.translate(2080, 2090);
        c.scale(1, p.breath);
        c.translate(-2080, -2090);
      }
      if (
        (name === "left_eye" || name === "right_eye") &&
        !(this.action === "Happy" || p.blink < 0.2)
      ) {
        const x = name === "left_eye" ? 1987 : 2297;
        c.translate(x, 945);
        c.scale(1, p.blink);
        c.translate(-x, -945);
      }
      if (name.endsWith("brow"))
        this.rotate(
          name === "left_brow" ? 1960 : 2330,
          800,
          name === "left_brow" ? p.brow : -p.brow,
        );
    };
    const paint = (part: Part) => {
      c.save();
      c.transform(
        ...(part.matrix as [number, number, number, number, number, number]),
      );
      c.fillStyle = part.fill;
      c.fill(this.paths.get(part.d)!);
      c.restore();
    };
    const left = new Path2D("M1400 1000H1905L1885 1544 1860 1649H1400Z");
    const right = new Path2D("M2220 1000H2700V1686H2254L2217 1593Z");
    const isArm = (name: string) => /^(left|right)_(forearm|hand)$/.test(name);
    const ordered = [
      ...layers.parts.filter((part) => !isArm(part.part)),
      ...layers.parts.filter((part) => isArm(part.part)),
    ];
    const paintedEyes = new Set<string>();
    for (const part of ordered) {
      const name = part.part;
      if (name === "shirt_and_sleeves_unsplit") {
        // Cut by masks, never redraw: the exact original shirt silhouette supplies all three pieces.
        c.save();
        joint(name);
        const body = new Path2D();
        body.rect(1300, 900, 1500, 1900);
        body.addPath(left);
        body.addPath(right);
        c.clip(body, "evenodd");
        paint(part);
        c.restore();
        for (const [side, mask] of [
          ["left_sleeve", left],
          ["right_sleeve", right],
        ] as const) {
          c.save();
          joint(side);
          c.clip(mask);
          paint(part);
          c.restore();
        }
        continue;
      }
      c.save();
      joint(name);
      if (
        (name === "left_eye" || name === "right_eye") &&
        !reduced &&
        (this.action === "Happy" || p.blink < 0.2)
      ) {
        if (!paintedEyes.has(name))
          (name === "left_eye"
            ? layers.expressions.closedLeft
            : layers.expressions.closedRight
          ).forEach(paint);
        paintedEyes.add(name);
      } else if (
        name === "mouth_neutral" &&
        (this.speaking ||
          ["Talk", "Happy", "Thinking"].includes(this.action)) &&
        !reduced
      ) {
        const expression =
          this.action === "Thinking" && !this.speaking
            ? layers.expressions.thinking
            : layers.expressions.laughing;
        c.translate(2150, 1185);
        c.scale(1, this.action === "Thinking" && !this.speaking ? 1 : p.mouth);
        c.translate(-2150, -1185);
        expression.forEach(paint);
      } else paint(part);
      c.restore();
    }
    // Sleeves cover upper-arm skin at the shoulder while hands stay in front of the shirt/face.
    const shirt = layers.parts.find(
      (part) => part.part === "shirt_and_sleeves_unsplit",
    )!;
    for (const [side, mask] of [
      ["left_sleeve", left],
      ["right_sleeve", right],
    ] as const) {
      c.save();
      joint(side);
      c.clip(mask);
      paint(shirt);
      c.restore();
    }
    c.restore();
    this.canvas.dataset.speaking = String(this.speaking);
    this.canvas.dataset.action = this.action;
    this.canvas.dataset.frame = String(Math.round(this.clock * 60));
  }
}
