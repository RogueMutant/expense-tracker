export default function MonthSummary({ summary }) {
  if (!summary) return null;
  const fmt = (n) =>
    `\u20A6${Number(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="card summary-bar">
      <div>
        <div className="stat-label">Staked</div>
        <div className="stat-value">{fmt(summary.totalStaked)}</div>
      </div>
      <div>
        <div className="stat-label">Returned</div>
        <div className="stat-value">{fmt(summary.totalReturned)}</div>
      </div>
      <div>
        <div className="stat-label">Net</div>
        <div className={`stat-value ${summary.totalNet > 0 ? "net-positive" : summary.totalNet < 0 ? "net-negative" : "net-neutral"}`}>
          {summary.totalNet >= 0 ? "+" : ""}{fmt(summary.totalNet)}
        </div>
      </div>
      <div>
        <div className="stat-label">Hit rate</div>
        <div className="stat-value">
          {summary.hitRate !== null ? `${summary.hitRate.toFixed(0)}%` : "\u2014"}
        </div>
      </div>
    </div>
  );
}
