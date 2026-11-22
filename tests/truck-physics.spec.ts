import { test, expect } from "./fixtures";
import {
  arenaTrack,
  surfaceY,
  truckPose,
  TRUCK_GEOMETRY,
} from "../src/game/truckTrack";
for (const [layout, w, h, start, end, scale] of [
  ["landscape", 1000, 600, 130, 850, 0.85],
  ["portrait", 600, 650, 100, 500, 0.68],
] as const) {
  test(`${layout}: tyres follow the painted ramp without clipping or floating`, () => {
    test.skip(
      test.info().project.name !== "desktop",
      "Pure geometry needs one run",
    );
    const track = arenaTrack(w, h);
    let previous = truckPose(track, start, scale);
    let climbed = false,
      descended = false,
      penetration = 0,
      largestGap = 0,
      maxStep = 0,
      maxTurn = 0;
    for (let x = start; x <= end; x += 2) {
      const pose = truckPose(track, x, scale),
        r = TRUCK_GEOMETRY.radius * scale;
      for (const localX of [TRUCK_GEOMETRY.rearX, TRUCK_GEOMETRY.frontX]) {
        const cx =
            pose.x +
            scale *
              (localX * Math.cos(pose.rotation) -
                TRUCK_GEOMETRY.axleY * Math.sin(pose.rotation)),
          cy =
            pose.y +
            scale *
              (localX * Math.sin(pose.rotation) +
                TRUCK_GEOMETRY.axleY * Math.cos(pose.rotation));
        let closest = Infinity;
        for (let i = 0; i <= 120; i++) {
          const dx = -r + (2 * r * i) / 120,
            tyre = cy + Math.sqrt(Math.max(0, r * r - dx * dx)),
            gap = surfaceY(track, cx + dx) - tyre;
          penetration = Math.max(penetration, -gap);
          closest = Math.min(closest, gap);
        }
        largestGap = Math.max(largestGap, closest);
      }
      maxStep = Math.max(maxStep, Math.abs(pose.y - previous.y));
      maxTurn = Math.max(maxTurn, Math.abs(pose.rotation - previous.rotation));
      if (pose.rotation < -0.1) climbed = true;
      if (pose.rotation > 0.1) descended = true;
      previous = pose;
    }
    expect(penetration).toBeLessThan(0.02);
    expect(largestGap).toBeLessThan(0.15);
    expect(maxStep).toBeLessThan(2);
    expect(maxTurn).toBeLessThan(0.04);
    expect(climbed && descended).toBe(true);
    expect(truckPose(track, start, scale).rotation).toBeCloseTo(0, 4);
    expect(truckPose(track, end, scale).rotation).toBeCloseTo(0, 4);
  });
}
