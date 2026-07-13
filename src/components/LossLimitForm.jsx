import { useState, useEffect } from "react";

export default function LossLimitForm({ currentLimit, onSave }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(currentLimit ? String(currentLimit) : "");
  }, [currentLimit]);

  const handleSave = async () => {
    const num = value ? Number(value) : null;
    if (num !== null && (num <= 0 || isNaN(num))) return;
    await onSave(num);
  };

  return (
    <div className="card">
      <div className="form-group">
        <label className="form-label">Monthly loss limit (&#8358;)</label>
        <input
          className="form-input mono"
          type="number"
          min="0"
          step="1000"
          placeholder="No limit set"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <div className="setting-desc">
        Set a limit for how much you're willing to lose in a calendar month.
        The dashboard will show a progress indicator when you approach or reach it.
        Leave blank for no limit.
      </div>
      <button className="btn btn-primary btn-sm" onClick={handleSave}>
        Save limit
      </button>
    </div>
  );
}
