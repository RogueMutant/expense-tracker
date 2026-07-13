import { useState, useEffect } from "react";
import { useSlips } from "../hooks/useSlips";
import UpDownIndicator from "../components/UpDownIndicator";
import { MonthlyBarChart, CumulativeLineChart } from "../components/AnalyticsCharts";

export default function AnalyticsPage() {
  const { fetchAnalyticsData } = useSlips();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fetchAnalyticsData]);

  if (loading) return <div className="loader" style={{ paddingTop: 60 }}>Loading{"\u2026"}</div>;

  return (
    <div className="analytics-page">
      <h1>Analytics</h1>

      <UpDownIndicator
        weeklyChange={data?.weeklyChange}
        monthlyChange={data?.monthlyChange}
        hitRate={data?.hitRate}
      />

      <MonthlyBarChart data={data?.monthlyNet || []} />
      <CumulativeLineChart data={data?.cumulative || []} />
    </div>
  );
}
