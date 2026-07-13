import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSlips } from "../hooks/useSlips";
import SlipForm from "../components/SlipForm";

export default function EditSlipPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchSlipById, updateSlip, deleteSlip, isLocked } = useSlips();
  const [slip, setSlip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSlipById(id)
      .then((data) => {
        setSlip(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, fetchSlipById]);

  const locked = slip ? isLocked(slip) : false;

  const handleSave = async (data) => {
    try {
      await updateSlip(id, {
        date: data.date,
        stake: data.stake,
        games_count: data.games_count,
        bookmaker: data.bookmaker,
        notes: data.notes,
        status: data.status,
        payout: data.payout,
      });
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this slip? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteSlip(id);
      navigate("/");
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  if (loading) return <div className="loader" style={{ paddingTop: 60 }}>Loading{"\u2026"}</div>;
  if (error) return <div className="card" style={{ borderColor: "var(--loss-bg)", color: "var(--loss-text)" }}>{error}</div>;

  return (
    <div>
      <h1 style={{ fontSize: "1.2rem", marginBottom: 16 }}>
        {locked ? "View slip" : slip.status === "pending" ? "Resolve slip" : "Edit slip"}
      </h1>
      <SlipForm
        initialData={slip}
        onSave={handleSave}
        onCancel={() => navigate("/")}
        locked={locked}
      />
      {!locked && (
        <button
          className="btn btn-danger btn-sm"
          onClick={handleDelete}
          disabled={deleting}
          style={{ marginTop: 8 }}
        >
          {deleting ? "Deleting\u2026" : "Delete slip"}
        </button>
      )}
    </div>
  );
}
