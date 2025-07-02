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

export default function History() {
  const { user } = useUser();
  const router = useRouter();

  const [groupedCheckins, setGroupedCheckins] = useState<GroupedCheckins>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!user.is_admin) {
      router.push('/home');
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


        const grouped: GroupedCheckins = {};
        data.forEach(entry => {
          if (!grouped[entry.date]) {
            grouped[entry.date] = [];
          }
          grouped[entry.date].push(entry);
        });

        setGroupedCheckins(grouped);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckins();
  }, [user, router]);

  if (!user || !user.is_admin) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-black">Registros de Check-ins</h1>

        {loading && (
          <div className="text-center my-4">
            <LoadingMessage />
          </div>
        )}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          Object.keys(groupedCheckins).length === 0 ? (
            <p className="text-black">Nenhum check-in registrado.</p>
          ) : (
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
          )
        )}
      </div>
    </ProtectedRoute>
  );
}