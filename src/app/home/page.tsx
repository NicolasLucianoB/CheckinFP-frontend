'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fullName = localStorage.getItem('userName');
    const firstName = fullName?.split(' ')[0];
    if (firstName) setUserName(firstName);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-black">
          {userName ? `A Paz, ${userName}!` : 'A Paz!'}
        </h1>
        <a
          href="/checkin"
          className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition text-lg"
        >
          Fazer Check-in
        </a>
      </div>
    </main>
  );
}