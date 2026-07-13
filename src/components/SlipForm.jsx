import { useState, useEffect } from "react";

const STATUSES = ["pending", "won", "lost"];
const QUICK_STAKES = [100, 200, 500, 1000, 5000, 10000];

function formatNaira(amount) {
  if (amount == null || amount === "") return "";
  return `\u20A6${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function SlipForm({ initialData, onSave, onCancel, locked }) {
  const [date, setDate] = useState("");
  const [stake, setStake] = useState("");
  const [gamesCount, setGamesCount] = useState("");
  const [bookmaker, setBookmaker] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending");
  const [payout, setPayout] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date || "");
      setStake(initialData.stake != null ? String(initialData.stake) : "");
      setGamesCount(initialData.games_count != null ? String(initialData.games_count) : "");
      setBookmaker(initialData.bookmaker || "");
      setNotes(initialData.notes || "");
      setStatus(initialData.status || "pending");
      setPayout(initialData.payout != null ? String(initialData.payout) : "");
    } else {
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
    }
  }, [initialData]);

  useEffect(() => {
    if (status === "lost") setPayout("0");
  }, [status]);

  const validate = () => {
    const e = {};
    if (!date) e.date = "Date is required";
    const stakeNum = Number(stake);
    if (!stake || stakeNum <= 0) e.stake = "Stake must be greater than 0";
    const games = Number(gamesCount);
    if (!gamesCount || games < 1 || !Number.isInteger(games)) e.gamesCount = "Must be 1 or more";
    if (!bookmaker.trim()) e.bookmaker = "Bookmaker is required";
    if (status === "won") {
      const payoutNum = Number(payout);
      if (!payout || payoutNum < 0) e.payout = "Payout is required for a win and cannot be negative";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (locked) return;
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSave({
        date,
        stake: Number(stake),
        games_count: Number(gamesCount),
        bookmaker: bookmaker.trim(),
        notes: notes.trim() || null,
        status,
        payout: status === "lost" ? 0 : status === "pending" ? null : Number(payout),
      });
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const net =
    status === "pending"
      ? null
      : (status === "lost" ? 0 : Number(payout || 0)) - Number(stake || 0);

  return (
    <form onSubmit={handleSubmit}>
      {errors.form && <div className="card" style={{ borderColor: "var(--loss-bg)", color: "var(--loss-text)", marginBottom: 12 }}>{errors.form}</div>}

      {locked && <div className="lock-notice">This slip is locked (resolved over 7 days ago). Read-only view.</div>}

      {isEdit && status === "pending" && (
        <div className="card" style={{ borderColor: "var(--pending-bg)", marginBottom: 12 }}>
          <div style={{ fontSize: "0.8rem", color: "var(--pending-text)", fontWeight: 600 }}>Resolve this slip</div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted-text)", marginTop: 4 }}>Update the outcome and payout below.</div>
        </div>
      )}

      {/* Outcome toggle — front and center for edit mode */}
      <div className="form-group">
        <label className="form-label">Outcome</label>
        <div className="outcome-toggle">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={status === s ? `active ${s}` : ""}
              onClick={() => !locked && setStatus(s)}
              disabled={locked}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Payout — prominent when resolving */}
      <div className="form-group">
        <label className="form-label">
          Payout (&#8358;)
          {status === "won" && <span style={{ color: "var(--win-text)" }}> *</span>}
        </label>
        <input
          className="form-input mono"
          type="number"
          step="any"
          min="0"
          placeholder="0"
          value={status === "lost" ? "0" : payout}
          onChange={(e) => setPayout(e.target.value)}
          disabled={status === "lost" || locked}
          readOnly={status === "lost"}
        />
        {errors.payout && <div className="form-error">{errors.payout}</div>}
      </div>

      {/* Net preview */}
      <div className={`net-preview ${status}`}>
        {net !== null ? (
          <>
            {status === "lost" ? `\u2212${formatNaira(stake)}` : net >= 0 ? `+${formatNaira(net)}` : formatNaira(net)}
          </>
        ) : (
          "\u2014"
        )}
        <span style={{ fontSize: "0.7rem", opacity: 0.7, display: "block", fontFamily: "var(--font-ui)", fontWeight: 400 }}>
          {status === "pending" ? "Net (pending)" : "Net profit / loss"}
        </span>
      </div>

      {/* Other fields (collapsible visual grouping) */}
      <div style={{ marginTop: 20 }}>
        {(!isEdit || status === "pending") && (
          <>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                className="form-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={locked && !locked}
              />
              {errors.date && <div className="form-error">{errors.date}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Stake (&#8358;)</label>
              <div className="quick-stakes">
                {QUICK_STAKES.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`quick-stake-btn ${Number(stake) === amt ? "active" : ""}`}
                    onClick={() => !locked && setStake(String(amt))}
                    disabled={locked}
                  >
                    &#8358;{amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <input
                className="form-input mono"
                type="number"
                step="any"
                min="0"
                placeholder="Amount staked"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                disabled={locked}
              />
              {errors.stake && <div className="form-error">{errors.stake}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Games on slip</label>
              <input
                className="form-input mono"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 5"
                value={gamesCount}
                onChange={(e) => setGamesCount(e.target.value)}
                disabled={locked}
              />
              {errors.gamesCount && <div className="form-error">{errors.gamesCount}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Bookmaker</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Bet9ja, BetKing"
                value={bookmaker}
                onChange={(e) => setBookmaker(e.target.value)}
                disabled={locked}
              />
              {errors.bookmaker && <div className="form-error">{errors.bookmaker}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Match list or anything else"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={locked}
              />
            </div>
          </>
        )}

        {isEdit && status !== "pending" && (
          <div style={{ fontSize: "0.78rem", color: "var(--muted-text-secondary)", marginBottom: 12 }}>
            Logged: {date} &middot; Stake: &#8358;{Number(stake).toLocaleString()} &middot; {gamesCount} game{gamesCount > 1 ? "s" : ""} &middot; {bookmaker}
            {notes && <span> &middot; {notes}</span>}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        {!locked && (
          <button className="btn btn-primary" type="submit" disabled={submitting} style={{ flex: 1 }}>
            {submitting ? "Saving\u2026" : isEdit ? "Save changes" : "Log slip"}
          </button>
        )}
        {onCancel && (
          <button className="btn btn-ghost" type="button" onClick={onCancel}>
            {locked ? "Back" : "Cancel"}
          </button>
        )}
      </div>
    </form>
  );
}
