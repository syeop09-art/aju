const assert = require("node:assert/strict");
const test = require("node:test");
const {
  formatPace,
  haversineKm,
  paceSecondsPerKm,
} = require("../.test-dist/domain/locationMath.js");
const {
  filterGpsSample,
} = require("../.test-dist/domain/locationFilter.js");

test("Haversine 공식은 위도 0.01도 이동을 약 1.11km로 계산한다", () => {
  const distance = haversineKm(
    { latitude: 37, longitude: 127 },
    { latitude: 37.01, longitude: 127 },
  );
  assert.ok(distance > 1.11 && distance < 1.113);
});

test("페이스는 거리와 활성 시간으로 계산한다", () => {
  const pace = paceSecondsPerKm(5, 30 * 60 * 1000);
  assert.equal(pace, 360);
  assert.equal(formatPace(pace), "6'00\"");
});

test("정확도 35m를 초과한 좌표는 제외한다", () => {
  const result = filterGpsSample(undefined, {
    latitude: 37,
    longitude: 127,
    accuracy: 50,
    timestamp: 1000,
  });
  assert.deepEqual(result, { accepted: false, reason: "poor-accuracy" });
});

test("정지 상태의 3m 미만 GPS 흔들림은 제외한다", () => {
  const previous = {
    latitude: 37,
    longitude: 127,
    accuracy: 5,
    timestamp: 1000,
  };
  const result = filterGpsSample(previous, {
    latitude: 37.000005,
    longitude: 127,
    accuracy: 5,
    timestamp: 2000,
  });
  assert.deepEqual(result, { accepted: false, reason: "stationary-noise" });
});

test("30km/h를 초과하는 순간이동 좌표는 제외한다", () => {
  const previous = {
    latitude: 37,
    longitude: 127,
    accuracy: 5,
    timestamp: 1000,
  };
  const result = filterGpsSample(previous, {
    latitude: 37.01,
    longitude: 127,
    accuracy: 5,
    timestamp: 2000,
  });
  assert.deepEqual(result, { accepted: false, reason: "gps-jump" });
});

test("정상적인 러닝 좌표는 평활화 후 누적 거리를 반환한다", () => {
  const previous = {
    latitude: 37,
    longitude: 127,
    accuracy: 5,
    timestamp: 1000,
  };
  const result = filterGpsSample(previous, {
    latitude: 37.0001,
    longitude: 127,
    accuracy: 5,
    timestamp: 6000,
  });
  assert.equal(result.accepted, true);
  if (result.accepted) {
    assert.ok(result.distanceKm > 0.003);
  }
});
