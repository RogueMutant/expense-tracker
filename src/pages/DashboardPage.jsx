import { useState, useEffect, useCallback } from "react";
import { useSlips } from "../hooks/useSlips";
import MonthSummary from "../components/MonthSummary";
import SlipList from "../components/SlipList";
import LossLimitBanner from "../components/LossLimitBanner";

export default function DashboardPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [slips, setSlips] = useState([]);
  const [summary, setSummary] = useState(null);
  const [currentMonthNet, setCurrentMonthNet] = useState(null);
  const [limit, setLimit] = useState(null);
  const [stakeMin, setStakeMin] = useState("");
  const [stakeMax, setStakeMax] = useState("");
  const [loadError, setLoadError] = useState("");
  const { fetchSlips, fetchMonthSummary, fetchLossLimit, fetchCurrentMonthLoss, deleteSlip, isLocked } = useSlips();

  const load = useCallback(async () => {
    setLoadError("");
    const [s, summ, lossNet, lim] = await Promise.all([
      fetchSlips(year, month).catch(() => null),
      fetchMonthSummary(year, month).catch(() => null),
      fetchCurrentMonthLoss().catch(() => null),
      fetchLossLimit().catch(() => null),
    ]);
    if (s === null && summ === null) {
      setLoadError("Could not load slip data. Check your database connection.");
    }
    setSlips(s ?? []);
    setSummary(summ);
    setCurrentMonthNet(lossNet);
    setLimit(lim);
  }, [year, month, fetchSlips, fetchMonthSummary, fetchCurrentMonthLoss, fetchLossLimit]);

  useEffect(() => { load(); }, [load]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const monthLabel = new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" });

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const filtered = slips.filter((s) => {
    const st = Number(s.stake);
    if (stakeMin !== "" && st < Number(stakeMin)) return false;
    if (stakeMax !== "" && st > Number(stakeMax)) return false;
    return true;
  });

  const handleDelete = async (id) => {
    try {
      await deleteSlip(id);
      setSlips((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setLoadError("Failed to delete slip.");
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1>Log</h1>
      </div>

      {loadError && (
        <div className="card" style={{ borderColor: "var(--loss-bg)", color: "var(--loss-text)", marginBottom: 12, fontSize: "0.85rem" }}>
          {loadError}
        </div>
      )}

      {isCurrentMonth && (
        <LossLimitBanner currentMonthNet={currentMonthNet} limit={limit} />
      )}

      <div className="month-picker">
        <button onClick={prevMonth}>&larr;</button>
        <span className="month-label">{monthLabel}</span>
        <button onClick={nextMonth} disabled={year >= now.getFullYear() && month >= now.getMonth() + 1}>
          &rarr;
        </button>
      </div>

      <MonthSummary summary={summary} />

      <div className="stake-filter">
        <input
          className="form-input mono"
          type="number"
          min="0"
          placeholder="Stake min"
          value={stakeMin}
          onChange={(e) => setStakeMin(e.target.value)}
        />
        <span style={{ color: "var(--muted-text-secondary)" }}>to</span>
        <input
          className="form-input mono"
          type="number"
          min="0"
          placeholder="Stake max"
          value={stakeMax}
          onChange={(e) => setStakeMax(e.target.value)}
        />
      </div>

      <SlipList slips={filtered} isLocked={isLocked} onDelete={handleDelete} />
    </div>
  );
}
