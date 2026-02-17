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

export default function ExposureBarChart({ data }) {
  return (
    <ResponsiveContainer width="95%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="_id" />
        <YAxis />
        <Tooltip formatter={(v) => `₹ ${v.toLocaleString()}`} />
        <Legend />
        <Bar dataKey="totalSumInsured" fill="#198754" name="Sum Insured" />
      </BarChart>
    </ResponsiveContainer>
  );
}
