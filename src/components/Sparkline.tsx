// A tiny dependency-free trend line — just enough for a stat card's
// "how did this move recently" glance, not a full charting library.
export function Sparkline({ points, height = 36 }: { points: number[]; height?: number }) {
  if (points.length === 0) {
    return null;
  }
  const width = 100;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const stepX = points.length > 1 ? width / (points.length - 1) : 0;
  const coords = points.map((value, i) => {
    const x = i * stepX;
    const y = height - ((value - min) / range) * height;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-9 w-full" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={coords.join(" ")} fill="none" stroke="var(--color-accent)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
