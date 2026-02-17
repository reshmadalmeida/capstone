import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#198754", "#31a681", "#1a5947", "#9f122c"];

export default function ReinsurerPieChart({ data }) {
  return (
    <ResponsiveContainer width="95%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="totalCededAmount"
          nameKey="_id"
          outerRadius={90}
          label
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => `₹ ${v.toLocaleString()}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
