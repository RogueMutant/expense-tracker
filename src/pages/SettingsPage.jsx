import { useState, useEffect } from "react";
import { useSlips } from "../hooks/useSlips";
import LossLimitForm from "../components/LossLimitForm";

export default function SettingsPage() {
  const { fetchLossLimit, setLossLimit } = useSlips();
  const [limit, setLimit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchLossLimit()
      .then(setLimit)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fetchLossLimit]);

  const handleSave = async (val) => {
    try {
      await setLossLimit(val);
      setLimit(val);
      setMsg(val ? "Limit saved" : "Limit removed");
      setTimeout(() => setMsg(""), 2000);
    } catch (err) {
      setMsg(err.message);
    }
  };

  if (loading) return <div className="loader" style={{ paddingTop: 60 }}>Loading\u2026</div>;

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      {msg && (
        <div className="card" style={{ borderColor: "var(--win-bg)", color: "var(--win-text)", marginBottom: 12 }}>
          {msg}
        </div>
      )}
      <LossLimitForm currentLimit={limit} onSave={handleSave} />
      <div className="card" style={{ marginTop: 12 }}>
        <div className="form-label" style={{ marginBottom: 4 }}>Account</div>
        <div style={{ fontSize: "0.8rem", color: "var(--muted-text-secondary)" }}>
          Password reset is handled via Supabase email. Contact the developer for account changes.
        </div>
      </div>
    </div>
  );
}
