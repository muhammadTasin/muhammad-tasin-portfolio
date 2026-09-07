import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RollingNumber } from "../components/rolling-number.tsx";
import { formatMetric, rollDuration, rollFrame } from "../lib/number-roll.ts";

test("count timing is metric-aware and bounded independently of fetch time", () => {
  assert.equal(rollDuration(0, 0), 0);
  assert.equal(rollDuration(0, 1), 140);
  assert.equal(rollDuration(0.999999, 1), 140, "near-settled retarget still has a finite duration");
  assert.ok(rollDuration(0, 89) > rollDuration(0, 1));
  assert.equal(rollDuration(0, 1_000_000), 400);
  assert.equal(rollDuration(498, 500), rollDuration(500, 498));
});

test("eased frames converge without overshoot for increases, decreases and retargets", () => {
  for (const [from, to] of [[0, 638], [498, 500], [500, 498], [42.5, 89], [1, 0]]) {
    assert.equal(rollFrame(from, to, 0).value, from);
    assert.deepEqual(rollFrame(from, to, 1), { value: to, offset: -0 });
    for (let i = 1; i < 10; i++) {
      const sample = rollFrame(from, to, i / 10);
      assert.ok(sample.value >= Math.min(from, to) && sample.value <= Math.max(from, to));
      assert.ok(sample.offset < 0 && sample.offset >= -0.65);
    }
  }
  assert.equal(rollFrame(498.5, 500, 0, -0.2).offset, -0.2, "retarget preserves vertical position");
  assert.ok(rollFrame(0, 100, 0.5).value > 50, "fast start and soft landing");
});

test("formatting retains zeros, grouping, suffixes and two-digit counts", () => {
  assert.equal(formatMetric(0), "0");
  assert.equal(formatMetric(2, 2), "02");
  assert.equal(formatMetric(24, 1, "d"), "24d");
  assert.equal(formatMetric(1234), "1,234");
});

test("SSR contains the exact verified number; unknown targets contain no animated measurements", () => {
  const render = props => renderToStaticMarkup(React.createElement(RollingNumber, props));
  assert.match(render({ value: 24, suffix: "d" }), /class="number-target">24d</);
  assert.match(render({ value: 2, minimumDigits: 2 }), />02</);
  const loading = render({ value: null, loading: true });
  assert.match(loading, /Loading/);
  assert.doesNotMatch(loading, /number-target|number-motion|[0-9]/);
  assert.match(render({ value: null }), /Unavailable/);
});
