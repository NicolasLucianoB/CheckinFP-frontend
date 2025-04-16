'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) setUserName(name);
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">
        {userName ? `Olá, ${userName}!` : 'Olá!'}
      </h1>
      {/* Aqui vão os gráficos, cards, filtros e outras funcionalidades */}
    </main>
  );
}