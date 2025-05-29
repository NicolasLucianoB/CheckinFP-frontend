'use client';

import LoadingMessage from '@/components/LoadingMessage';
import { useUser } from '@/contexts/UserContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

type ApiUser = {
  id: string;
  name: string;
  email: string;
  roles: string;
  is_admin: boolean;
  photo_url?: string;
};

type ApiResponse = {
  message?: string;
  token?: string;
  user?: ApiUser;
};

type FormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<FormData>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
    criteriaMode: 'all',
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    clearErrors();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const resData: ApiResponse = await response.json();
      console.log('Resposta da API:', resData);

      if (!response.ok) {
        setLoading(false);
        if (resData.message?.toLowerCase().includes('email')) {
          setError('email', { message: '*Email não encontrado, irmão(ã)' });
        } else {
          setError('password', { message: '*Senha incorreta, irmão(ã)' });
        }
        return;
      }

      if (setUser && resData.user) {
        const formattedUser = {
          ...resData.user,
          avatarUrl: resData.user?.photo_url ?? '',
        };
        setUser(formattedUser);
        localStorage.setItem('user', JSON.stringify(formattedUser));
      }
      localStorage.setItem('token', resData.token ?? '');

      router.push('/home');
    } catch (err) {
      setLoading(false);
      const typedError = err as Error;
      setError('password', { message: typedError.message });
    }
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
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow-md w-full max-w-sm space-y-4">
            <h1 className="text-xl font-semibold text-black">Login</h1>

            <input
              type="text"
              placeholder="Email"
              {...register('email', {
                required: '*Vigia! todos os campos são obrigatórios',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: '*Insira um email válido, irmão(ã)',
                },
              })}
              className={`w-full border px-3 p-2 placeholder-gray-400 text-black rounded ${errors.email ? 'border-red-600' : 'border-gray-400'}`}
            />
            {errors.email && errors.email.type !== 'required' && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                {...register('password', {
                  required: '*Vigia! todos os campos são obrigatórios',
                })}
                className={`w-full border px-3 p-2 placeholder-gray-400 text-black rounded pr-10 ${errors.password ? 'border-red-600' : 'border-gray-400'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-800"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
              {errors.password && errors.password.type !== 'required' && (
                <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            {(errors.email?.type === 'required' || errors.password?.type === 'required') && (
              <p className="text-center text-red-600 text-sm mt-1">
                *Vigia! todos os campos são obrigatórios
              </p>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                className="w-32 px-6 py-2 rounded text-white font-medium transition text-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed mx-auto"
              >
                Entrar
              </button>
            </div>

            {loading && <div className="text-center mt-4"><LoadingMessage /></div>}

            <p className="text-black mt-2 text-center">
              Novo no ministério?{' '}
              <button
                type="button"
                onClick={() => {
                  clearErrors();
                  setLoading(true);
                  router.push('/signup');
                }}
                className="text-blue-500 hover:underline"
              >
                Cadastre-se
              </button>
            </p>
          </form>
        </motion.div>
      </main>
    </AnimatePresence>
  );
}