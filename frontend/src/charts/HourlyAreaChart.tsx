import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface HourlyAreaChartProps {
  data: { hour: number; timeLabel: string; count: number }[];
  height?: number;
}

export const HourlyAreaChart: React.FC<HourlyAreaChartProps> = ({ data, height = 240 }) => {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey="timeLabel"
            stroke="#6b7280"
            fontSize={10}
            tickLine={false}
            interval={2}
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
            itemStyle={{ color: '#a78bfa' }}
          />
          <Area
            type="monotone"
            dataKey="count"
            name="Incidents"
            stroke="#8b5cf6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#hourlyGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
