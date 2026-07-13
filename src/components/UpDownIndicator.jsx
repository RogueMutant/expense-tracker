export default function UpDownIndicator({ weeklyChange, monthlyChange, hitRate }) {
  const renderValue = (val) => {
    if (val === null || val === undefined)
      return <span className="neutral">\u2014</span>;
    const isPos = val > 0;
    const isNeg = val < 0;
    const cls = isPos ? "positive" : isNeg ? "negative" : "neutral";
    const arrow = isPos ? "\u25B2" : isNeg ? "\u25BC" : "";
    return <span className={cls}>{arrow} {Math.abs(val).toFixed(0)}%</span>;
  };

  return (
    <div className="updown-row">
      <div className="updown-card">
        <div className="ud-label">This week</div>
        <div className="ud-value">{renderValue(weeklyChange)}</div>
      </div>
      <div className="updown-card">
        <div className="ud-label">This month</div>
        <div className="ud-value">{renderValue(monthlyChange)}</div>
      </div>
      <div className="updown-card">
        <div className="ud-label">Hit rate</div>
        <div className="ud-value">
          {hitRate !== null ? (
            <span className="neutral">{hitRate.toFixed(0)}%</span>
          ) : (
            <span className="neutral">\u2014</span>
          )}
        </div>
      </div>
    </div>
  );
}
