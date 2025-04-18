'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem, irmão');
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password,
        }),
      });

      if (!res.ok) {
        throw new Error('Erro ao criar conta');
      }

      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-black">Sign Up</h1>

        <input
          type="text"
          name="name"
          placeholder="Nome completo"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border border-gray-400 px-3 py-2 rounded placeholder-gray-400 text-black focus:placeholder-transparent"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border border-gray-400 px-3 py-2 rounded placeholder-gray-400 text-black focus:placeholder-transparent"
        />

        <input
          type="text"
          name="role"
          placeholder="Função"
          value={formData.role}
          onChange={handleChange}
          required
          className="w-full border border-gray-400 px-3 py-2 rounded placeholder-gray-400 text-black focus:placeholder-transparent"
        />

        <input
          type="password"
          name="password"
          placeholder="Senha"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full border border-gray-400 px-3 py-2 rounded placeholder-gray-400 text-black focus:placeholder-transparent"
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirme sua senha"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="w-full border border-gray-400 px-3 py-2 rounded placeholder-gray-400 text-black focus:placeholder-transparent"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          Cadastrar
        </button>

        <p className="text-black mt-2 text-center">
          Já está no ministério?{' '}
          <a href="/login" className="text-blue-500 hover:underline">
            Faça login
          </a>
        </p>

      </form>
    </main>
  );
}
