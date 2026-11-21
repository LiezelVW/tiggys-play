/** A single ramp outline shared by rendering and tyre contact. */
const RAMP_PIXELS = [
  [475, 724],
  [492, 713],
  [552, 696],
  [610, 667],
  [667, 631],
  [702, 621],
  [832, 621],
  [860, 630],
  [919, 667],
  [977, 697],
  [1047, 713],
  [1060, 724],
] as const;
export const TRUCK_GEOMETRY = { rearX: -73, frontX: 75, axleY: 35, radius: 45 };
export type Track = {
  points: readonly { x: number; y: number }[];
  groundY: number;
};
export function arenaTrack(width: number, height: number): Track {
  const artScale = 1000 / 1536,
    top = (height - 1024 * artScale) / 2;
  const groundY = top + 724 * artScale,
    rampWidth = width <= 600 ? 200 : 382,
    rampHeight = width <= 600 ? 45 : 67;
  return {
    groundY,
    points: RAMP_PIXELS.map(([x, y]) => ({
      x: width / 2 - rampWidth / 2 + ((x - 475) / 585) * rampWidth,
      y: groundY - ((724 - y) / 103) * rampHeight,
    })),
  };
}
export function surfaceY(track: Track, x: number) {
  const points = track.points;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1],
      b = points[i];
    if (x >= a.x && x <= b.x)
      return a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x);
  }
  return track.groundY;
}
/** Highest supporting contact under a circular tyre. Exact for each linear ramp segment. */
function supportY(track: Track, x: number, radius: number) {
  let y = track.groundY - radius;
  for (let i = 1; i < track.points.length; i++) {
    const a = track.points[i - 1],
      b = track.points[i];
    const lo = Math.max(a.x, x - radius),
      hi = Math.min(b.x, x + radius);
    if (lo > hi) continue;
    const slope = (b.y - a.y) / (b.x - a.x);
    const contact = Math.max(
      lo,
      Math.min(hi, x - (radius * slope) / Math.sqrt(1 + slope * slope)),
    );
    const road = a.y + slope * (contact - a.x);
    y = Math.min(
      y,
      road - Math.sqrt(Math.max(0, radius * radius - (contact - x) ** 2)),
    );
  }
  return y;
}
export type TruckPose = {
  x: number;
  y: number;
  rotation: number;
  rear: { x: number; y: number };
  front: { x: number; y: number };
};
/** Solve the rigid wheelbase against both tyre contacts; no arbitrary bobbing path. */
export function truckPose(
  track: Track,
  x: number,
  scale: number,
  lift = 0,
): TruckPose {
  const { rearX, frontX, axleY, radius } = TRUCK_GEOMETRY;
  const wheelX = (local: number, angle: number) =>
    x + scale * (local * Math.cos(angle) - axleY * Math.sin(angle));
  const contacts = (angle: number) => {
    const rear = wheelX(rearX, angle),
      front = wheelX(frontX, angle);
    return {
      rear: { x: rear, y: supportY(track, rear, radius * scale) },
      front: { x: front, y: supportY(track, front, radius * scale) },
    };
  };
  let lo = -Math.PI / 3,
    hi = Math.PI / 3,
    rotation = 0;
  for (let i = 0; i < 24; i++) {
    rotation = (lo + hi) / 2;
    const c = contacts(rotation);
    const error =
      c.front.y - c.rear.y - (frontX - rearX) * scale * Math.sin(rotation);
    if (Math.abs(error) < 0.0001) break;
    if (error > 0) lo = rotation;
    else hi = rotation;
  }
  const c = contacts(rotation);
  const rearRoot =
    c.rear.y -
    scale * (rearX * Math.sin(rotation) + axleY * Math.cos(rotation));
  const frontRoot =
    c.front.y -
    scale * (frontX * Math.sin(rotation) + axleY * Math.cos(rotation));
  return {
    x,
    y: (rearRoot + frontRoot) / 2 - lift,
    rotation,
    rear: { x: c.rear.x, y: c.rear.y - lift },
    front: { x: c.front.x, y: c.front.y - lift },
  };
}
