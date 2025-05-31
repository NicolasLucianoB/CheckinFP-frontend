'use client';

import ProtectedRoute from '@/components/ProtectedRouts';
import RankingChart from '@/components/RankingChart';
import { useUser } from '@/contexts/UserContext';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarClock } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const { user } = useUser();
  const firstName = user?.name?.split(' ')[0];
  const [lastCheckin, setLastCheckin] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  useEffect(() => {
    if (!user || user.is_admin) return;

    const fetchLastCheckin = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token usado:', token);
        const res = await fetch(`${API_URL}/checkin/last`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Status da resposta:', res.status);
        if (!res.ok) throw new Error('Falha ao buscar último check-in');
        const data = await res.json();
        if (data.last_checkin) {
          setLastCheckin(data.last_checkin);
        }
      } catch (error) {
        console.error(error);
        setLastCheckin(null);
      }
    };

    fetchLastCheckin();
  }, [user, API_URL]);

  const formatDateSimple = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleString('pt-BR', options).replace(',', ' às');
  };

  return (
    <ProtectedRoute>
      <AnimatePresence>
        <main className="min-h-[calc(100vh-106px)] flex items-center justify-center bg-gray-100 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            <h1 className="text-3xl font-bold text-black">
              {user
                ? user.is_admin
                  ? `A Paz, ${user.name}!`
                  : firstName
                    ? `A Paz, ${firstName}!`
                    : 'A Paz!'
                : 'A Paz!'}
            </h1>
            {!user?.is_admin && (
              <p className="text-sm text-black text-center flex items-center gap-1">
                <CalendarClock className="w-4 h-4 text-black" />
                {lastCheckin ? `Último Check-in: ${formatDateSimple(lastCheckin)}` : 'Nenhum check-in registrado'}
              </p>
            )}
            <Link
              href="/checkin"
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition text-lg"
            >
              Fazer Check-in
            </Link>
            <div className="w-full max-w-4xl mt-8">
              <h2 className="text-xl font-semibold text-black mb-4">Ranking de Pontualidade</h2>
              <RankingChart />
            </div>
          </motion.div>
        </main>
      </AnimatePresence>
    </ProtectedRoute>
  );
}