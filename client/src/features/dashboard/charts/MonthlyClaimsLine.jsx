import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function MonthlyClaimsLine({ data }) {
  return (
    <ResponsiveContainer width="95%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="_id.month" tickFormatter={(m) => MONTHS[m - 1]} />
        <YAxis />
        <Tooltip formatter={(v) => `₹ ${v.toLocaleString()}`} />
        <Legend />
        <Line type="monotone" dataKey="totalClaimsAmount" stroke="#31a681" />
      </LineChart>
    </ResponsiveContainer>
  );
}
