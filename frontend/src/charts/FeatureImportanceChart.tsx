import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface FeatureImportanceChartProps {
  data: { feature: string; importance: number }[];
  height?: number;
}

export const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({
  data,
  height = 240,
}) => {
  const chartData = [...data].reverse();

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 10, right: 30, left: 60, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
          <XAxis
            type="number"
            stroke="#6b7280"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
          />
          <YAxis
            type="category"
            dataKey="feature"
            stroke="#9ca3af"
            fontSize={11}
            tickLine={false}
            width={120}
            axisLine={{ stroke: '#374151' }}
          />
          <Tooltip
            formatter={(val: number) => [`${(val * 100).toFixed(2)}%`, 'Importance Weight']}
            contentStyle={{
              backgroundColor: '#111827',
              borderColor: '#374151',
              borderRadius: '8px',
              color: '#f3f4f6',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="importance" name="Relative Weight" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
