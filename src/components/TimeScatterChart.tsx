'use client';

import { FunnelIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ScatterPoint = {
  day_index: number;
  time_minutes: number;
  weekday: string;
  display_time: string;
  user: string;
  date: string;
  avatar_url?: string;
};

const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const converterMinutosParaHora = (minutos: number) => {
  const rounded = Math.round(minutos);
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

type PeriodOption = 'total' | 'monthly' | 'last_event';
type ScopeOption = 'team' | 'individual';

export default function TimeScatterChart() {
  const [data, setData] = useState<ScatterPoint[]>([]);
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
        const response = await fetch(`${API_URL}/dashboard/checkin-scatter?period=${period}&scope=${scope}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await response.json();
        const jittered = (json || []).map((d: ScatterPoint) => ({
          ...d,
          day_index: d.day_index + (Math.random() - 0.5) * 0.6,
          time_minutes: d.time_minutes + (Math.random() - 0.5) * 12,
        }));
        setData(jittered);
      } catch (error) {
        console.error('Erro ao buscar dados de dispersão:', error);
      }
    };

    fetchData();
  }, [period, scope]);

  return (
    <div className="w-full max-w-full h-[430px] border border-gray-300 rounded-lg p-4 shadow mx-auto md:max-w-[800px] md:h-[550px]">
      <h2 style={{ color: 'black' }} className="font-semibold mb-3">Horários de Chegada por Dia</h2>

      <div className="relative mb-4 px-2" ref={filterRef}>
        <button
          className="flex items-center text-sm gap-1 bg-zinc-200 text-black px-2 py-1 rounded-full"
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
          </div>
        )}
      </div>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="85%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="day_index"
              type="number"
              tickFormatter={(value) => diasDaSemana[Math.max(0, Math.min(6, Math.round(value)))]}
              domain={[0, 6]}
              allowDecimals={false}
              label={{ value: 'Dia da Semana', position: 'bottom', offset: 0 }}
            />
            <YAxis
              dataKey="time_minutes"
              type="number"
              domain={[480, 1320]} // 8h às 22h
              tickFormatter={converterMinutosParaHora}
              label={{ value: 'Horário de Chegada', angle: -90, position: 'insideLeft', offset: -10, dy: 70 }}
            />
            <ZAxis type="number" range={[60, 120]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const { user, display_time, date, avatar_url } = payload[0].payload;
                  const size = 32;
                  return (
                    <div className="bg-white p-2 border rounded shadow text-black flex items-center gap-2">
                      <div className="rounded-full overflow-hidden" style={{ width: size, height: size }}>
                        <Image
                          src={avatar_url || '/assets/logo.png'}
                          alt="avatar"
                          width={size}
                          height={size}
                          className="object-cover rounded-full"
                        />
                      </div>
                      <div className="text-sm">
                        <strong>{user}</strong><br />
                        {date} às {display_time}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter
              name="Check-ins"
              data={data}
              fill="#FEA341"
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-in-out"
            />
          </ScatterChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ color: 'black' }}>Nenhum dado disponível</div>
      )}
    </div>
  );
}