import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

interface CategoryBarChartProps {
  data: { category: string; count: number; percentage?: number }[];
  height?: number;
}

const COLORS = [
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#10b981',
  '#06b6d4',
];

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({ data, height = 280 }) => {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey="category"
            stroke="#6b7280"
            fontSize={10}
            tickLine={false}
            interval={0}
            angle={-30}
            textAnchor="end"
            axisLine={{ stroke: '#374151' }}
          />
          <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              borderColor: '#374151',
              borderRadius: '8px',
              color: '#f3f4f6',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="count" name="Incidents" radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
