'use client';

import ProtectedRoute from '@/components/ProtectedRouts';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';

export default function HomePage() {
  const { user } = useUser();
  const firstName = user?.name?.split(' ')[0];

  return (
    <ProtectedRoute>
      <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-3xl font-bold text-black">
            {firstName ? `A Paz, ${firstName}!` : 'A Paz!'}
            <p className="text-sm text-black text-center ">
              Último Check-in:
            </p>
          </h1>
          <Link
            href="/checkin"
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition text-lg"
          >
            Fazer Check-in
          </Link>
        </div>
      </main>
    </ProtectedRoute>
  );
}