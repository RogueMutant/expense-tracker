import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

function nairaTick(value) {
  if (value === 0) return "\u20A60";
  const abs = Math.abs(value);
  const suffix = abs >= 1000000 ? "M" : abs >= 1000 ? "k" : "";
  const div = abs >= 1000000 ? 1000000 : 1000;
  const n = abs >= 1000 ? abs / div : abs;
  return `${value < 0 ? "\u2212" : ""}\u20A6${n.toFixed(0)}${suffix}`;
}

export function MonthlyBarChart({ data }) {
  const minWidth = Math.max(data.length * 50, 280);
  return (
    <div className="chart-card">
      <h3>Monthly net</h3>
      <div className="chart-wrapper">
        <div className="chart-inner" style={{ minWidth }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 8, right: 4, bottom: 4, left: -12 }}>
              <XAxis
                dataKey="month"
                tick={{ fill: "#8fa898", fontSize: 10, fontFamily: "Inter" }}
                axisLine={{ stroke: "#2b5b47" }}
                tickLine={false}
                interval={0}
                angle={data.length > 8 ? -30 : 0}
                textAnchor={data.length > 8 ? "end" : "middle"}
                height={data.length > 8 ? 50 : 30}
              />
              <YAxis
                tickFormatter={nairaTick}
                tick={{ fill: "#8fa898", fontSize: 10, fontFamily: "JetBrains Mono" }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  background: "#123f30",
                  border: "1px solid #2b5b47",
                  borderRadius: 6,
                  color: "#f5f1e8",
                  fontSize: 12,
                  fontFamily: "JetBrains Mono",
                }}
                formatter={(value) => [`\u20A6${Number(value).toLocaleString()}`, "Net"]}
              />
              <Bar
                dataKey="net"
                shape={(props) => {
                  const { x, y, width, height, fill } = props;
                  const isNeg = height < 0;
                  return (
                    <rect
                      x={x}
                      y={isNeg ? y : y}
                      width={width}
                      height={Math.abs(height)}
                      fill={isNeg ? "#c4432b" : "#2d7a4f"}
                      rx={2}
                      ry={2}
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function CumulativeLineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <h3>Cumulative balance</h3>
        <div className="empty-state" style={{ padding: 24 }}>
          <p>No resolved slips yet</p>
        </div>
      </div>
    );
  }

  const minWidth = Math.max(data.length * 7, 280);

  return (
    <div className="chart-card">
      <h3>Cumulative balance</h3>
      <div className="chart-wrapper">
        <div className="chart-inner" style={{ minWidth }}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 8, right: 4, bottom: 4, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2b5b47" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#8fa898", fontSize: 10, fontFamily: "Inter" }}
                axisLine={{ stroke: "#2b5b47" }}
                tickLine={false}
                interval={Math.max(Math.floor(data.length / 10), 0)}
              />
              <YAxis
                tickFormatter={nairaTick}
                tick={{ fill: "#8fa898", fontSize: 10, fontFamily: "JetBrains Mono" }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  background: "#123f30",
                  border: "1px solid #2b5b47",
                  borderRadius: 6,
                  color: "#f5f1e8",
                  fontSize: 12,
                  fontFamily: "JetBrains Mono",
                }}
                formatter={(value) => [`\u20A6${Number(value).toLocaleString()}`, "Balance"]}
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#e8b84b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#e8b84b" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
