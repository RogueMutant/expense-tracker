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
  const { loading, fetchSlips, fetchMonthSummary, fetchLossLimit, fetchCurrentMonthLoss, isLocked } = useSlips();

  const load = useCallback(async () => {
    try {
      const [s, summ, lossNet, lim] = await Promise.all([
        fetchSlips(year, month),
        fetchMonthSummary(year, month),
        fetchCurrentMonthLoss(),
        fetchLossLimit(),
      ]);
      setSlips(s);
      setSummary(summ);
      setCurrentMonthNet(lossNet);
      setLimit(lim);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    }
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

  return (
    <div>
      <div className="dashboard-header">
        <h1>Log</h1>
      </div>

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

      {loading ? (
        <div className="loader">Loading{"\u2026"}</div>
      ) : (
        <SlipList slips={slips} isLocked={isLocked} />
      )}
    </div>
  );
}
