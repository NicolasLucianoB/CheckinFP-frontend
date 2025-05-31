import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis,
} from 'recharts';

type VolunteerRanking = {
  id: string;
  name: string;
  checkins: number;
  punctual: number;
  percentage: number;
};

const RankingChart: React.FC = () => {
  const [data, setData] = useState<VolunteerRanking[]>([]);
  const [period, setPeriod] = useState<'monthly' | 'last_event' | 'total'>('monthly');
  const [scope, setScope] = useState<'team' | 'individual'>('team');

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/dashboard/punctuality-ranking`, {
          params: { period, scope },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setData(response.data.ranking);
      } catch (error) {
        console.error('Erro ao buscar ranking de pontualidade:', error);
      }
    };

    fetchRanking();
  }, [period, scope]);

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <select
          value={period}
          onChange={e => setPeriod(e.target.value as any)}
          className="border border-gray-300 rounded-md px-3 py-1 text-black bg-white cursor-pointer"
        >
          <option value="monthly">Mensal</option>
          <option value="last_event">Último Evento</option>
          <option value="total">Total Geral</option>
        </select>
        <select
          value={scope}
          onChange={e => setScope(e.target.value as any)}
          className="border border-gray-300 rounded-md px-3 py-1 text-black bg-white cursor-pointer"
        >
          <option value="team">Equipe</option>
          <option value="individual">Pessoal</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
        >
          <CartesianGrid stroke="#ddd" />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#000" }} />
          <YAxis
            dataKey="name"
            type="category"
            width={150}
            stroke="#000"
            tick={{ fill: "#000" }}
          />
          <Tooltip contentStyle={{ color: '#000' }} formatter={(value: number) => `${value.toFixed(2)}%`} />
          <Bar dataKey="percentage" fill="#3EA7E0">
            <LabelList
              dataKey="percentage"
              position="right"
              formatter={(v: number) => `${v.toFixed(1)}%`}
              fill="#000"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RankingChart;