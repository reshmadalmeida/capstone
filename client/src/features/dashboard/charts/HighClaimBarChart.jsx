import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function HighClaimBarChart({ data }) {
  return (
    <ResponsiveContainer width="95%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="policyNumber" />
        <YAxis />
        <Tooltip formatter={(v) => `₹ ${v.toLocaleString()}`} />
        <Legend />
        <Bar dataKey="totalClaimAmount" fill="#1a5947" />
      </BarChart>
    </ResponsiveContainer>
  );
}
