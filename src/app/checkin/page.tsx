'use client'

import ProtectedRoute from '@/components/ProtectedRouts';
import { useUser } from '@/contexts/UserContext';
import { useState } from 'react';

export default function CheckinPage() {
  const { user } = useUser();
  const firstName = user?.name?.split(' ')[0];
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/checkin/${user?.id}`);
      const data = await res.json();
      setMessage(data.message || 'Check-in realizado com sucesso!');
    } catch (error) {
      setMessage('Erro ao registrar check-in.');
    }
    setLoading(false);
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6 space-y-6">
        <h1 className="text-3xl font-bold text-black">
          {firstName}, registre seu check-in!
        </h1>

        <p className="text-lg text-gray-600 text-center">
          Clique no ícone de câmera e escaneie o QR Code.
        </p>

        <button
          onClick={handleCheckin}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-green-700 disabled:bg-gray-400 transition"
        >
          {loading ? 'Enviando...' : 'Fazer Check-in'}
        </button>

        {message && <p className="text-blue-600 font-medium text-center">{message}</p>}
      </main>
    </ProtectedRoute>
  );
}