'use client';

import LoadingMessage from '@/components/LoadingMessage';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

type FormData = {
  email: string;
};

export default function Page() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, clearErrors } = useForm<FormData>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const onSubmit = async (data: FormData) => {
    clearErrors();
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      if (res.ok) {
        setMessage('Enviaremos um link para redefinir sua senha, irmão(ã).');
      } else {
        const result = await res.json();
        if (result?.message === 'Email não encontrado') {
          setMessage('*Email não encontrado, irmão(ã)');
        } else {
          setMessage('Erro ao enviar solicitação. Tente novamente.');
        }
      }
    } catch {
      setMessage('Erro de rede. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    clearErrors();
    setLoading(true);
    router.push('/login');
  };

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
          <h2 className="text-center text-2xl font-bold text-black mb-6">Esqueci minha senha</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow-md w-full max-w-sm space-y-4">
            <h1 className="text-sm font-normal text-black text-center mb-5">
              *Informe o e-mail cadastrado para receber um link de redefinição.*
            </h1>

            <input
              type="email"
              placeholder="Email"
              {...register('email', {
                required: '*Vigia! todos os campos são obrigatórios',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: '*Insira um e-mail válido, irmão(ã)',
                },
              })}
              className={`w-full border px-3 py-2 placeholder-gray-400 text-black rounded ${errors.email ? 'border-red-600' : 'border-gray-400'}`}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}

            <button
              type="submit"
              className="w-32 px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition text-center mx-auto block"
              disabled={loading}
            >
              Enviar
            </button>

            {loading && (
              <div className="flex justify-center mt-2">
                <LoadingMessage />
              </div>
            )}

            {message && (
              <p className="text-green-600 text-center mt-2">{message}</p>
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