'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TopEventsChartProps {
  data: Array<{
    event: string;
    posts_count: number;
    id: string;
  }>;
  onEventClick?: (eventId: string) => void;
}

export function TopEventsChart({ data, onEventClick }: TopEventsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="event" 
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
          fontSize={12}
        />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => [value, 'Posts']}
          labelFormatter={(label: string) => `Event: ${label}`}
        />
        <Bar 
          dataKey="posts_count" 
          fill="#8884d8"
          onClick={(data) => onEventClick?.(data.id)}
          style={{ cursor: 'pointer' }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
