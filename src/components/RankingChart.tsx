'use client';

import { FunnelIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Avatar from './Avatar';

type CustomTickProps = {
  x: number;
  y: number;
  payload: {
    value: string;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type RankingEntry = {
  id: string;
  name: string;
  checkins: number;
  punctual: number;
  percentage: number;
  avatar_url?: string;
};

type SortOption = 'attendance' | 'punctuality';
type PeriodOption = 'total' | 'monthly' | 'last_event';
type ScopeOption = 'team' | 'individual';

export default function RankingChart() {
  const [data, setData] = useState<RankingEntry[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('punctuality');
  const [period, setPeriod] = useState<PeriodOption>('total');
  const [scope, setScope] = useState<ScopeOption>('team');
  const [showFilters, setShowFilters] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, [showFilters]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${API_URL}/dashboard/punctuality-ranking?sort_by=${sortBy}&period=${period}&scope=${scope}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const json = await response.json();
        console.log('Dados do ranking recebidos:', json.ranking);
        setData(json.ranking || []);
      } catch (error) {
        console.error('Erro ao buscar ranking:', error);
      }
    };

    fetchData();
  }, [sortBy, period, scope]);

  const renderCustomAvatarTick = ({ x, y, payload }: CustomTickProps) => {
    const entry = data.find((d) => d.id === payload.value);
    const size = 36;
    const offsetY = -1;
    const offsetX = -1;

    return (
      <foreignObject
        x={x - size / 2 + offsetX}
        y={y + offsetY}
        width={size}
        height={size}
        style={{ overflow: 'visible' }}
      >
        {entry?.avatar_url ? (
          <Avatar imageUrl={entry.avatar_url || undefined} size={size} />
        ) : (
          <Avatar imageUrl={undefined} size={size} />
        )}
      </foreignObject>
    );
  };

  return (
    <div className="ranking-chart">
      <div
        className="w-full max-w-full h-[380px] border border-gray-300 rounded-lg p-4 shadow mx-auto md:max-w-[800px] md:h-[520px] overflow-x-auto overflow-y-hidden"
        style={{ maxWidth: '100vw', paddingLeft: '8px', paddingRight: '8px' }}
      >
        <h2 style={{ color: 'black' }} className="font-semibold mb-3">Ranking de Voluntários</h2>
        <div className="relative mb-2" ref={filterRef}>
          <button
            className="flex items-center text-sm gap-1 bg-zinc-200 text-black px-2 py-1 rounded-full shadow-inner hover:bg-zinc-300"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon className="w-5 h-5" />
            Filtrar
          </button>

          {showFilters && (
            <div className="absolute z-10 mt-2 bg-white border rounded flex gap-2 text-black p-2">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as PeriodOption)}
                className="px-2 py-1 text-sm rounded bg-zinc-100"
              >
                <option value="total">Total Geral</option>
                <option value="monthly">Mensal</option>
                <option value="last_event">Último Evento</option>
              </select>

              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as ScopeOption)}
                className="px-2 py-1 text-sm rounded bg-zinc-100"
              >
                <option value="team">Equipe Toda</option>
                <option value="individual">Individual</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-2 py-1 text-sm rounded bg-zinc-100"
              >
                <option value="punctuality">Pontualidade</option>
                <option value="attendance">Assiduidade</option>
              </select>
            </div>
          )}
        </div>
        <div style={{ minWidth: `${data.length * 60}px`, height: '100%' }}>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="id" tick={renderCustomAvatarTick} interval={0} />
              <YAxis />
              <Tooltip
                formatter={(value: number) => {
                  if (sortBy === 'punctuality') {
                    return value === 100 ? '100%' : `${value.toFixed(1)}%`;
                  } else {
                    return `${value} check-ins`;
                  }
                }}
                labelFormatter={(value: string) => {
                  const user = data.find(d => d.id === value);
                  return user?.name || value;
                }}
                contentStyle={{ color: 'black' }}
                labelStyle={{ color: '#333', fontWeight: 'normal' }}
              />
              <Bar dataKey={sortBy === 'punctuality' ? 'percentage' : 'checkins'} fill="#FEA341" barSize={40}>
                <LabelList
                  dataKey={sortBy === 'punctuality' ? 'percentage' : 'checkins'}
                  position="top"
                  formatter={(value: number) =>
                    sortBy === 'punctuality'
                      ? (value === 100 ? '100%' : `${value.toFixed(1)}%`)
                      : value
                  }
                  style={{ fill: 'black' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {!data.length && (
        <div style={{ color: 'black' }}>Nenhum dado encontrado para esse filtro.</div>
      )}
    </div>
  );
}
