'use client';

import ProtectedRoute from '@/components/ProtectedRouts';
import { useUser } from '@/contexts/UserContext';
import useIsClient from '@/hooks/useIsClient';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

export default function HomePage() {
  const isClient = useIsClient();
  const { user } = useUser();
  const firstName = user?.name?.split(' ')[0];

  if (!isClient) return null;
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
              {firstName ? `A Paz, ${firstName}!` : 'A Paz!'}
            </h1>
            <p className="text-sm text-black text-center">
              Último Check-in:
            </p>
            <Link
              href="/checkin"
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition text-lg"
            >
              Fazer Check-in
            </Link>
          </motion.div>
        </main>
      </AnimatePresence>
    </ProtectedRoute>
  );
}