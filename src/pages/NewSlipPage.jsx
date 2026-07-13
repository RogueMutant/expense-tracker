import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSlips } from "../hooks/useSlips";
import SlipForm from "../components/SlipForm";

export default function NewSlipPage() {
  const navigate = useNavigate();
  const { createSlip } = useSlips();
  const [error, setError] = useState("");

  const handleSave = async (data) => {
    try {
      await createSlip(data);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.2rem", marginBottom: 16 }}>Log a slip</h1>
      {error && (
        <div className="card" style={{ borderColor: "var(--loss-bg)", color: "var(--loss-text)", marginBottom: 12 }}>{error}</div>
      )}
      <SlipForm onSave={handleSave} onCancel={() => navigate("/")} />
    </div>
  );
}
