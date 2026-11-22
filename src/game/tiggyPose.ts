export const characterActions = [
  "Idle",
  "Wave",
  "Walk",
  "Talk",
  "Clap",
  "Celebrate",
  "Thinking",
  "Help",
  "Happy",
  "Sit",
] as const;
export type CharacterAction = (typeof characterActions)[number];
export function characterPose(
  action: CharacterAction,
  seconds: number,
  reduced = false,
) {
  const t = reduced ? 0 : seconds,
    s = Math.sin,
    pi = Math.PI;
  const p = {
    lift: 0,
    lean: 0,
    breath: 1,
    head: 0,
    leftArm: 0,
    rightArm: 0,
    leftElbow: 0,
    rightElbow: 0,
    leftWrist: 0,
    rightWrist: 0,
    leftHip: 0,
    rightHip: 0,
    leftKnee: 0,
    leftAnkle: 0,
    rightAnkle: 0,
    rightKnee: 0,
    blink: 1,
    mouth: 1,
    brow: 0,
  };
  if (reduced) return p;
  p.breath = 1 + 0.006 * s(t * 2);
  p.head = 0.012 * s(t * 1.3);
  const blinkTime = t % 4.1;
  p.blink =
    blinkTime > 3.85 ? Math.max(0.06, Math.abs(blinkTime - 3.975) / 0.125) : 1;
  if (action === "Wave") {
    p.rightArm = -2.0;
    p.rightElbow = -0.35 + 0.24 * s(t * 13);
    p.rightWrist = 0.3 * s(t * 13);
    p.head = -0.07;
  }
  if (action === "Walk") {
    const a = s(t * 7);
    p.leftHip = 0.26 * a;
    p.rightHip = -0.26 * a;
    p.leftKnee = 0.24 * Math.max(0, -a);
    p.rightKnee = 0.24 * Math.max(0, a);
    p.leftArm = -0.22 * a;
    p.rightArm = 0.22 * a;
    p.lift = -18 * Math.abs(s(t * 7));
    p.leftAnkle = -(p.leftHip + p.leftKnee) * 0.75;
    p.rightAnkle = -(p.rightHip + p.rightKnee) * 0.75;
  }
  if (action === "Talk") {
    p.mouth = 0.35 + 0.9 * Math.abs(s(t * 11));
    p.head = 0.025 * s(t * 4);
    p.rightArm = -0.2;
    p.rightElbow = -0.3;
  }
  if (action === "Clap") {
    const gap = 12 + (65 * (1 + s(t * 12))) / 2;
    function arm(
      sx: number,
      sy: number,
      ex: number,
      ey: number,
      wx: number,
      wy: number,
      tx: number,
      ty: number,
      side: number,
    ) {
      const upper = Math.hypot(ex - sx, ey - sy),
        lower = Math.hypot(wx - ex, wy - ey),
        dx = tx - sx,
        dy = ty - sy,
        d = Math.min(upper + lower - 1, Math.hypot(dx, dy));
      const angle =
        Math.atan2(dy, dx) +
        side *
          Math.acos(
            Math.max(
              -1,
              Math.min(
                1,
                (upper * upper + d * d - lower * lower) / (2 * upper * d),
              ),
            ),
          );
      const elbowX = sx + Math.cos(angle) * upper,
        elbowY = sy + Math.sin(angle) * upper;
      const shoulder = angle - Math.atan2(ey - sy, ex - sx),
        elbow =
          Math.atan2(ty - elbowY, tx - elbowX) -
          Math.atan2(wy - ey, wx - ex) -
          shoulder;
      return [shoulder, elbow];
    }
    [p.leftArm, p.leftElbow] = arm(
      1840,
      1415,
      1760,
      1720,
      1750,
      2010,
      2080 - gap,
      1740,
      1,
    );
    [p.rightArm, p.rightElbow] = arm(
      2270,
      1415,
      2390,
      1700,
      2430,
      1980,
      2080 + gap,
      1740,
      -1,
    );
    p.lift = -6 * Math.abs(s(t * 6));
  }
  if (action === "Celebrate") {
    p.leftArm = 2.35;
    p.rightArm = -2.35;
    p.leftElbow = 0.2;
    p.rightElbow = -0.2;
    p.lift = -150 * Math.max(0, s(t * 5));
    p.leftKnee = 0.12 * Math.max(0, -s(t * 5));
    p.rightKnee = p.leftKnee;
    p.head = 0.04 * s(t * 5);
  }
  if (action === "Thinking") {
    p.head = -0.13;
    p.brow = -0.18;
    p.rightArm = -0.5;
    p.rightElbow = -2;
    p.rightWrist = -0.15 + 0.08 * s(t * 3);
  }
  if (action === "Help") {
    p.head = 0.07;
    p.leftArm = -0.4;
    p.rightArm = 0.4;
    p.leftElbow = -1.2;
    p.rightElbow = 1.2;
    p.leftWrist = -0.2 * s(t * 4);
    p.rightWrist = 0.2 * s(t * 4);
    p.brow = 0.08;
  }
  if (action === "Sit") {
    p.lift = 100;
    p.leftHip = -0.55;
    p.rightHip = 0.55;
    p.leftKnee = 1.1;
    p.rightKnee = -1.1;
    p.leftArm = -0.12;
    p.rightArm = 0.12;
  }
  if (action === "Happy") {
    p.head = 0.06 * s(t * 8);
    p.lift = -20 * Math.abs(s(t * 8));
    p.mouth = 0.9 + 0.12 * s(t * 10);
    p.blink = 0.35;
    p.leftArm = -0.13;
    p.rightArm = 0.13;
  }
  return p;
}
export const actionDuration: Partial<Record<CharacterAction, number>> = {
  Wave: 2.1,
  Clap: 1.6,
  Celebrate: 2.3,
  Thinking: 2.2,
  Help: 2.1,
  Happy: 2.2,
};
