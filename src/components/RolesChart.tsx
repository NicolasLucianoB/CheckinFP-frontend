'use client';

import { useEffect, useState } from 'react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type RoleEntry = {
  role: string;
  count: number;
  percentage: number;
};

const COLORS = [
  '#FE2674', // Pink
  '#FF8042', // Light Orange
  '#FEA341', // Orange
  '#FFBB28', // Yellow
  '#80C447', // Light Green
  '#28B242', // Green 
  '#3EA7E0', // Blue
];

export default function RolesChart() {
  const [data, setData] = useState<RoleEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/dashboard/roles-distribution`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await response.json();
        const sorted = [...(json || [])].sort((a, b) => a.role.localeCompare(b.role));
        setData(sorted);
      } catch (error) {
        console.error('Erro ao buscar distribuição de funções:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full max-w-full h-[300px] border border-gray-300 rounded-lg p-4 shadow mx-auto md:max-w-[800px] md:h-[450px]">
      <h2 style={{ color: 'black' }} className="text-lg font-semibold">Distribuição de Voluntário por Função</h2>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="90%">
          <PieChart key={data.map(d => d.role).join('-')}>
            <Pie
              data={data}
              dataKey="percentage"
              nameKey="role"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={4}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-in-out"
              label={({ role }) => role}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.role}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ color: 'black' }}>Nenhum dado disponível</div>
      )}
    </div>
  );
}
