'use client';

import useIsClient from '@/hooks/useIsClient';
import { LightBulbIcon } from '@heroicons/react/24/solid';
import {
  Camera,
  GraduationCap,
  Instagram,
  Projector,
  Video,
  Youtube,
} from 'lucide-react';
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

const ICONS: Record<string, React.ElementType> = {
  Câmera: Video,
  Transmissão: Youtube,
  Projeção: Projector,
  Fotografia: Camera,
  "Redes Sociais": Instagram,
  "Em treinamento": GraduationCap,
  Iluminação: LightBulbIcon,
};

export default function RolesChart() {
  const isClient = useIsClient();
  const [data, setData] = useState<RoleEntry[]>([]);

  interface CustomLabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    outerRadius: number;
    index: number;
  }

  const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, index }: CustomLabelProps) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const role = data[index]?.role;
    const Icon = ICONS[role];

    if (!Icon) return null;

    return (
      <g transform={`translate(${x},${y})`} textAnchor="middle" dominantBaseline="central">
        <foreignObject x={-10} y={-10} width={20} height={20}>
          <Icon size={20} color={COLORS[index % COLORS.length]} />
        </foreignObject>
      </g>
    );
  };

  useEffect(() => {
    if (!isClient) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/dashboard/roles-distribution`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await response.json();
        const sorted = [...(json || [])].sort((a, b) => a.role.localeCompare(b.role));
        setData([]);
        setTimeout(() => setData(sorted), 100); // força o remount e animação
      } catch (error) {
        console.error('Erro ao buscar distribuição de funções:', error);
      }
    };

    fetchData();
  }, [isClient]);

  if (!isClient) return null;

  return (
    <div className="w-full max-w-full h-[300px] border border-gray-300 rounded-lg p-4 shadow mx-auto md:max-w-[800px] md:h-[450px]">
      <h2 style={{ color: 'black' }} className="font-semibold">Distribuição de Voluntário por Função</h2>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="90%">
          <PieChart key={data.map((d) => d.role).join(',')}>
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
              labelLine={false}
              label={renderCustomLabel}
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
