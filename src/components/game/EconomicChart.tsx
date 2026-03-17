'use client';

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { QuarterData } from '@/lib/simulation-engine';

export const EconomicChart: React.FC<{ history: QuarterData[] }> = ({ history }) => {
  const chartData = history.map(h => ({
    name: `Q${h.quarter}`,
    inflation: parseFloat(h.metrics.inflation.toFixed(2)),
    unemployment: parseFloat(h.metrics.unemployment.toFixed(2)),
    gdp: parseFloat(h.metrics.gdp.toFixed(2)),
    mood: parseFloat((h.metrics.publicMood / 10).toFixed(2)), 
    debt: parseFloat((h.metrics.debtToGDP / 10).toFixed(2)),
  }));

  return (
    <div className="w-full h-[400px] glass-morphism rounded-xl p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent rounded-full blur-[100px]" />
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorGdp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorInf" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#ffffff40" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            fontFamily="Space Grotesk"
          />
          <YAxis 
            stroke="#ffffff40" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            fontFamily="Space Grotesk"
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e1e24', border: '1px solid #ffffff10', borderRadius: '12px', color: '#fff' }}
            itemStyle={{ fontSize: '11px', fontFamily: 'Inter' }}
            cursor={{ stroke: '#ffffff20', strokeWidth: 1 }}
          />
          <Legend 
            iconType="circle" 
            wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontFamily: 'Space Grotesk', textTransform: 'uppercase', letterSpacing: '0.1em' }} 
          />
          <Area 
            type="monotone" 
            dataKey="gdp" 
            stroke="#34d399" 
            fillOpacity={1} 
            fill="url(#colorGdp)" 
            strokeWidth={3} 
          />
          <Area 
            type="monotone" 
            dataKey="inflation" 
            stroke="#fb7185" 
            fillOpacity={1} 
            fill="url(#colorInf)" 
            strokeWidth={3} 
          />
          <Line 
            type="monotone" 
            dataKey="unemployment" 
            stroke="#fbbf24" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#fbbf24' }} 
            activeDot={{ r: 6 }} 
          />
          <Line 
            type="monotone" 
            name="Debt (scaled)"
            dataKey="debt" 
            stroke="#f472b6" 
            strokeWidth={2} 
            strokeDasharray="5 5"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
