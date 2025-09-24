'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TopTagsChartProps {
  data: Array<{
    tag: string;
    count: number;
  }>;
}

export function TopTagsChart({ data }: TopTagsChartProps) {
  console.log('TopTagsChart received data:', data);
  console.log('Data length:', data.length);
  console.log('First item:', data[0]);
  
  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }
  
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
          dataKey="tag" 
          angle={-45}
          textAnchor="end"
          height={80}
          fontSize={12}
        />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => [value, 'Count']}
          labelFormatter={(label: string) => `Tag: ${label}`}
        />
        <Bar dataKey="count" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}
