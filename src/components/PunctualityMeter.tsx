'use client';

import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const COLORS = ['#FE2674', '#FFBB28', '#80C447']; // vermelho, amarelo, verde

const data = [
  { name: 'Ruim', value: 33.33 },
  { name: 'Médio', value: 33.33 },
  { name: 'Bom', value: 33.34 },
];

export default function PunctualityMeter() {
  const [average, setAverage] = useState<number>(0);
  const [period, setPeriod] = useState<'monthly' | 'last_event' | 'total'>('total');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/dashboard/punctuality-meter?period=${period}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await response.json();
        setAverage(json.average || 0);
      } catch (error) {
        console.error('Erro ao buscar média de pontualidade:', error);
      }
    };

    fetchData();
  }, [period]);

  const cx = 150;
  const cy = 150;
  const needleLength = 70;
  const total = 100;
  const angle = 180 * (average / total);

  return (
    <div className="w-full max-w-full h-[300px] border border-gray-300 rounded-lg p-4 shadow mx-auto md:max-w-[800px] md:h-[450px]">
      <h2 style={{ color: 'black' }} className="font-semibold mb-3">Média de Pontualidade do Ministério</h2>

      <div className="filters flex flex-wrap gap-4 mb-2">
        <div className="rounded-full bg-zinc-200 shadow-inner px-1 py-1">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'monthly' | 'last_event' | 'total')}
            style={{ color: 'black' }}
            className="bg-transparent focus:outline-none"
          >
            <option value="total" style={{ color: 'black' }}>Total Geral</option>
            <option value="monthly" style={{ color: 'black' }}>Mensal</option>
            <option value="last_event" style={{ color: 'black' }}>Último Evento</option>
          </select>
        </div>
      </div>

      <div className="flex justify-center items-center h-full">
        <ResponsiveContainer width={300} height={300}>
          <PieChart key={`${period}-${average}`}>
            <Pie
              dataKey="value"
              startAngle={180}
              endAngle={0}
              data={data}
              cx={cx}
              cy={cy}
              innerRadius={60}
              outerRadius={100}
              stroke="none"
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-in-out"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]} />
            <circle cx={cx} cy={cy} r={6} fill="#666" stroke="none" />
            <g transform={`translate(${cx}, ${cy}) rotate(${angle - 90})`}>
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={-needleLength}
                stroke="#333"
                strokeWidth={3}
              />
            </g>
            <text x="50%" y="60%" textAnchor="middle" fill="#333" fontSize={14}>
              {`${average.toFixed(1)}%`}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}