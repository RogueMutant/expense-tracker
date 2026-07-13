import { useNavigate } from "react-router-dom";

function formatNaira(n) {
  const num = Number(n);
  if (isNaN(num)) return "";
  const prefix = num >= 0 ? "" : "\u2212";
  return `${prefix}\u20A6${Math.abs(num).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function SlipList({ slips, isLocked, onDelete }) {
  const navigate = useNavigate();

  if (!slips || slips.length === 0) {
    return (
      <div className="empty-state">
        <p>No slips this month</p>
      </div>
    );
  }

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this slip?")) return;
    onDelete(id);
  };

  return (
    <div className="slip-list">
      {slips.map((slip) => {
        const net =
          slip.status === "pending"
            ? null
            : Number(slip.payout || 0) - Number(slip.stake);
        const locked = isLocked(slip);

        return (
          <div
            key={slip.id}
            className="slip-row"
            onClick={() => navigate(`/edit/${slip.id}`)}
          >
            <div>
              <div className="slip-date">{slip.date}</div>
              <div className="slip-desc">
                {slip.games_count} game{slip.games_count > 1 ? "s" : ""}{slip.bookmaker ? ` \u00B7 ${slip.bookmaker}` : ""}
              </div>
            </div>
            <div className="slip-right">
              <div className="slip-stake">{formatNaira(slip.stake)}</div>
              <div className="slip-actions">
                <div className={`status-badge ${slip.status}`}>
                  {slip.status.charAt(0).toUpperCase() + slip.status.slice(1)}
                  {locked && " [locked]"}
                </div>
                {!locked && onDelete && (
                  <button
                    className="slip-delete-btn"
                    onClick={(e) => handleDelete(e, slip.id)}
                    title="Delete slip"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
            <div className={`slip-net ${net > 0 ? "net-positive" : net < 0 ? "net-negative" : "net-neutral"}`}>
              {net !== null ? (net >= 0 ? "+" : "") + formatNaira(net) : "\u2014"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
