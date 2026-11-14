import assert from "node:assert/strict";
import { test } from "node:test";

import { haversineDistanceKm } from "./haversine";

test("haversine returns zero for identical coordinates", () => {
  const point = { latitude: 28.4744, longitude: 77.504 };

  assert.equal(haversineDistanceKm(point, point), 0);
});

test("haversine calculates a known one-degree longitude distance", () => {
  const distance = haversineDistanceKm(
    { latitude: 0, longitude: 0 },
    { latitude: 0, longitude: 1 }
  );

  assert.ok(Math.abs(distance - 111.195) < 0.01);
});

test("haversine is symmetric and uses straight-line geometry", () => {
  const alphaOne = { latitude: 28.4757, longitude: 77.5101 };
  const alphaTwo = { latitude: 28.4791, longitude: 77.5145 };

  const forward = haversineDistanceKm(alphaOne, alphaTwo);
  const reverse = haversineDistanceKm(alphaTwo, alphaOne);

  assert.ok(forward > 0);
  assert.ok(Math.abs(forward - reverse) < 0.000001);
});
