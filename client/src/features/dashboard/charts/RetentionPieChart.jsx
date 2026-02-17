import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function RetentionPieChart({ retained, ceded }) {
  const data = [
    { name: "Retained", value: retained },
    { name: "Ceded", value: ceded },
  ];

  return (
    <ResponsiveContainer width="95%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" outerRadius={90} label>
          <Cell fill="#198754" />
          <Cell fill="#9f122c" />
        </Pie>
        <Tooltip formatter={(v) => `₹ ${v.toLocaleString()}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
