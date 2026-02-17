import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function LossRatioRadial({ value }) {
  return (
    <ResponsiveContainer width="95%" height={260}>
      <RadialBarChart
        innerRadius="70%"
        outerRadius="100%"
        data={[{ name: "Loss Ratio", value: Number(value) }]}
        startAngle={180}
        endAngle={0}
      >
        <RadialBar dataKey="value" fill="#9f122c" background />
        <Tooltip formatter={(v) => `${v}%`} />
        <Legend />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}
