'use client';

import useIsClient from '@/hooks/useIsClient';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const COLORS = ['#FE2674', '#FFBB28', '#80C447']; // vermelho, amarelo, verde

const data = [
  { name: 'Ruim', value: 33.33 },
  { name: 'Médio', value: 33.33 },
  { name: 'Bom', value: 33.34 },
];

export default function PunctualityMeter() {
  const isClient = useIsClient();

  const [average, setAverage] = useState<number>(0);
  const [period, setPeriod] = useState<'monthly' | 'last_event' | 'total'>('total');
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isClient) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters, isClient]);

  useEffect(() => {
    if (!isClient) return;

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
  }, [period, isClient]);

  if (!isClient) return null;

  const cx = 150;
  const cy = 150;
  const needleLength = 70;
  const total = 100;
  const angle = 180 * (average / total);

  return (
    <div className="w-full max-w-full h-[300px] border border-gray-300 rounded-lg p-4 shadow mx-auto md:max-w-[800px] md:h-[450px]">
      <h2 style={{ color: 'black' }} className="font-semibold mb-3">Média de Pontualidade do Ministério</h2>

      <div className="relative mb-2" ref={filterRef}>
        <button
          className="flex items-center text-sm gap-1 bg-zinc-200 text-black px-2 py-1 rounded-full"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FunnelIcon className="w-5 h-5" />
          Filtrar
        </button>

        {showFilters && (
          <div className="absolute z-10 mt-2 bg-white border rounded text-black p-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'monthly' | 'last_event' | 'total')}
              className="px-2 py-1 text-sm rounded bg-zinc-100"
            >
              <option value="total">Total Geral</option>
              <option value="monthly">Mensal</option>
              <option value="last_event">Último Evento</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex justify-center items-center h-full">
        {isClient && (
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
        )}
      </div>
    </div>
  );
}