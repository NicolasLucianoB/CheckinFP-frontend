'use client';

import LoadingMessage from '@/components/LoadingMessage';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

type FormData = {
  password: string;
  confirmPassword: string;
};

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { register, handleSubmit, watch, formState: { errors }, setError, clearErrors } = useForm<FormData>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const onSubmit = async (data: FormData) => {
    clearErrors();
    if (!token) {
      setError('password', { type: 'manual', message: 'Token inválido ou ausente, varão(oa).' });
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', { type: 'manual', message: '*As senhas não coincidem, irmão(ã).' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, new_password: data.password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError('password', { type: 'manual', message: result.message || 'Erro ao redefinir senha.' });
        return;
      }

      setSuccessMessage('Senha redefinida com sucesso, irmão(ã)! Agora é só fazer login.');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch {
      setError('password', { type: 'manual', message: 'Erro inesperado. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  if (!token) {
    return <p className="text-center text-red-600">Token inválido ou ausente, varão(oa).</p>;
  }

  return (
    <AnimatePresence>
      <main className="min-h-[calc(100vh-106px)] flex items-center justify-center bg-gray-100 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <h2 className="text-center text-2xl font-bold text-black mb-6">Redefina sua senha</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow-md w-full max-w-sm space-y-4">
            <h1 className="text-xl font-semibold text-black text-center mb-4">Nova senha</h1>
            <input
              type="password"
              {...register('password', {
                required: '*Vigia! todos os campos são obrigatórios',
                minLength: {
                  value: 6,
                  message: '*A senha deve conter no mínimo 6 caracteres, irmão(ã)',
                },
              })}
              placeholder="Nova senha"
              className={`w-full border px-3 py-2 placeholder-gray-400 text-black rounded ${errors.password ? 'border-red-600' : 'border-gray-400'}`}
            />
            {typeof errors.password?.message === 'string' && (
              <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
            )}

            <input
              type="password"
              {...register('confirmPassword', {
                required: '*Vigia! todos os campos são obrigatórios',
                validate: (value) => value === watch('password') || '*As senhas não coincidem, irmão(ã).',
              })}
              placeholder="Confirme a nova senha"
              className={`w-full border px-3 py-2 placeholder-gray-400 text-black rounded ${errors.confirmPassword ? 'border-red-600' : 'border-gray-400'}`}
            />
            {typeof errors.confirmPassword?.message === 'string' && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
              disabled={loading}
            >
              Redefinir Senha
            </button>

            {loading && (
              <div className="flex justify-center mt-2">
                <LoadingMessage />
              </div>
            )}

            {successMessage && (
              <p className="text-green-600 text-center mt-2">{successMessage}</p>
            )}

            <p className="text-black mt-2 text-center">
              Lembrou da senha?{' '}
              <button type="button" onClick={handleGoToLogin} className="text-blue-500 hover:underline">
                Fazer login
              </button>
            </p>
          </form>
        </motion.div>
      </main>
    </AnimatePresence>
  );
}
