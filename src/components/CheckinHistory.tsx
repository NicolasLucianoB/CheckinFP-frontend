'use client';

import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingMessage from './LoadingMessage';
import ProtectedRoute from './ProtectedRouts';

interface CheckinEntry {
  id: string;
  user: string;
  date: string;
  time: string;
}

interface GroupedCheckins {
  [date: string]: CheckinEntry[];
}

export default function CheckinHistory() {
  const { user } = useUser();
  const router = useRouter();

  const [groupedCheckins, setGroupedCheckins] = useState<GroupedCheckins>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [weekdays, setWeekdays] = useState<{ [date: string]: string }>({});

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const fetchCheckins = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/checkin-history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Erro ao buscar histórico de check-ins');

        const data: CheckinEntry[] = await res.json();

        const filteredData = user.is_admin
          ? data
          : data.filter(entry => entry.user === user.name);

        const grouped: GroupedCheckins = {};
        filteredData.forEach(entry => {
          if (!grouped[entry.date]) {
            grouped[entry.date] = [];
          }
          grouped[entry.date].push(entry);
        });

        setGroupedCheckins(grouped);

        const weekdayMap: { [date: string]: string } = {};
        Object.keys(grouped).forEach(date => {
          const parsedDate = new Date(date.split('/').reverse().join('-'));
          const weekday = parsedDate.toLocaleDateString('pt-BR', { weekday: 'long' });
          weekdayMap[date] = weekday.charAt(0).toUpperCase() + weekday.slice(1);
        });
        setWeekdays(weekdayMap);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckins();
  }, [isClient, user, router]);

  if (!isClient || !user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto p-4 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-black text-center">
          {user.is_admin ? 'Histórico Geral de Check-ins' : 'Seus Check-ins'}
        </h1>

        {loading && (
          <div className="text-center my-4">
            <LoadingMessage />
          </div>
        )}

        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && Object.keys(groupedCheckins).length === 0 && (
          <p className="text-black">Nenhum check-in registrado.</p>
        )}

        {!loading && !error && (
          user.is_admin ? (
            Object.entries(groupedCheckins).map(([date, entries]) => (
              <div key={date} className="mb-8">
                <h2 className="text-xl font-semibold mb-2 text-gray-700">{date}</h2>
                <table className="w-full border border-gray-300 rounded text-black">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 border border-gray-300 text-left">Voluntário</th>
                      <th className="p-2 border border-gray-300 text-left">Horário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(({ id, user, time }) => (
                      <tr key={id} className="hover:bg-gray-100">
                        <td className="p-2 border border-gray-300">{user}</td>
                        <td className="p-2 border border-gray-300">{time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          ) : (

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {Object.entries(groupedCheckins).map(([date, entries]) => (
                <div key={date} className="border border-gray-300 rounded p-3 bg-gray-50">
                  <div className="grid grid-cols-5 items-center mb-2">
                    <h3 className="text-gray-700 font-semibold col-span-4">{date}</h3>
                    <span className="text-sm text-gray-500 text-right col-span-1 flex items-center justify-end h-full whitespace-nowrap">
                      {weekdays[date]}
                    </span>
                  </div>
                  <ul className="list-disc pl-5 text-black">
                    {entries.map(({ id, time }) => (
                      <li key={id}>{time}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </ProtectedRoute>
  );
}