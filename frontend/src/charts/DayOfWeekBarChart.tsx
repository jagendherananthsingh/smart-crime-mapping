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

interface DayOfWeekBarChartProps {
  data: { dayName: string; count: number }[];
  height?: number;
}

export const DayOfWeekBarChart: React.FC<DayOfWeekBarChartProps> = ({ data, height = 240 }) => {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey="dayName"
            stroke="#6b7280"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#374151' }}
            tickFormatter={(val) => val.slice(0, 3)}
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
            {data.map((entry) => (
              <Cell
                key={`day-${entry.dayName}`}
                fill={
                  entry.dayName === 'Saturday' || entry.dayName === 'Sunday'
                    ? '#f43f5e'
                    : '#3b82f6'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
