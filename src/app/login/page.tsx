'use client';

import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();  // Acesso ao setUser diretamente
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      console.log('Resposta da API:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Email ou senha errados, irmão');
      }

      if (setUser) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      localStorage.setItem('token', data.token);

      router.push('/home');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-black">Login</h1>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border border-gray-400 px-3 p-2 placeholder-gray-400 text-black rounded focus:placeholder-transparent"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Senha"
          value={form.password}
          onChange={handleChange}
          className="w-full border border-gray-400 px-3 p-2 placeholder-gray-400 text-black rounded focus:placeholder-transparent"
          required
        />
        {error && <p className="text-red-600">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Entrar
        </button>

        <p className="text-black mt-2 text-center">
          Novo no ministério?{' '}
          <a href="/signup" className="text-blue-500 hover:underline">
            Cadastre-se
          </a>
        </p>
      </form>
    </main>
  );
}