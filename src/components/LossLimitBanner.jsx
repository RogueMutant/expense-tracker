export default function LossLimitBanner({ currentMonthNet, limit }) {
  if (!limit) return null;
  const loss = currentMonthNet < 0 ? Math.abs(currentMonthNet) : 0;
  if (loss === 0) return null;
  const pct = Math.min((loss / Number(limit)) * 100, 100);

  return (
    <div className="loss-limit-banner">
      <div style={{ flex: 1 }}>
        {loss >= Number(limit)
          ? `You've reached your monthly limit of \u20A6${Number(limit).toLocaleString()}`
          : `Monthly loss: \u20A6${loss.toLocaleString()} / \u20A6${Number(limit).toLocaleString()}`}
      </div>
      <div
        style={{
          width: 80,
          height: 6,
          background: "var(--pitch-green)",
          borderRadius: 3,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: loss >= Number(limit) ? "var(--loss-bg)" : "var(--accent)",
            borderRadius: 3,
            transition: "width 0.3s",
          }}
        />
      </div>
    </div>
  );
}
