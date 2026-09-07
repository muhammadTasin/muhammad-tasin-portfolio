/** A bounded presentation tween; the verified target is never modified. */
export function rollDuration(from: number, to: number) {
  const distance = Math.abs(to - from);
  return distance === 0 ? 0 : Math.min(400, 140 + Math.log10(Math.max(1, distance)) * 90);
}

export function rollFrame(from: number, to: number, progress: number, entryOffset = -0.65) {
  const t = Math.max(0, Math.min(1, progress));
  const eased = 1 - (1 - t) ** 3;
  return {
    value: t === 1 ? to : from + (to - from) * eased,
    // The whole number enters from above as the count rapidly decelerates.
    offset: entryOffset * (1 - eased),
  };
}

export function formatMetric(value: number, minimumDigits = 1, suffix = "") {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
    minimumIntegerDigits: minimumDigits,
  }) + suffix;
}
