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

interface TopLocationsBarChartProps {
  data: { location: string; count: number; highSeverityCount?: number }[];
  height?: number;
}

export const TopLocationsBarChart: React.FC<TopLocationsBarChartProps> = ({
  data,
  height = 280,
}) => {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
          <XAxis type="number" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="location"
            stroke="#9ca3af"
            fontSize={11}
            tickLine={false}
            width={110}
            axisLine={{ stroke: '#374151' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              borderColor: '#374151',
              borderRadius: '8px',
              color: '#f3f4f6',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="count" name="Total Incidents" fill="#06b6d4" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
