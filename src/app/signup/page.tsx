'use client';

import LoadingMessage from '@/components/LoadingMessage';
import RoleSelector from '@/components/RoleSelector';
import { useUser } from '@/contexts/UserContext';
import useIsClient from '@/hooks/useIsClient';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

type FormData = {
  name: string;
  email: string;
  roles: string[];
  password: string;
  confirmPassword: string;
};

export default function SignUpPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const { register, handleSubmit, watch, formState: { errors }, setError, clearErrors, control } = useForm<FormData>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    criteriaMode: 'all',
    shouldFocusError: true,
    defaultValues: {
      roles: [],
    },
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isClient = useIsClient();


  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          roles: data.roles,
          password: data.password,
        }),
      });

      type ApiResponse = {
        message?: string;
        token?: string;
        user?: {
          id: number;
          name: string;
          email: string;
          roles: string;
          is_admin: boolean;
        };
      };

      let result: ApiResponse = {};
      try {
        result = await res.json();
      } catch {
        // falha no parse JSON
      }

      if (!res.ok) {
        if (result.message) {
          setError('email', { type: 'manual', message: result.message });
        } else {
          console.log('Erro inesperado sem mensagem do backend');
        }
        setLoading(false);
        return;
      }

      if (result.user && setUser) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
      }
      localStorage.setItem('token', result.token ?? '');
      router.push('/home');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError('email', { type: 'manual', message: err.message || 'Erro ao criar conta' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    clearErrors();
    setLoading(true);
    router.push('/login');
  };

  if (!isClient) {
    return null;
  }

  return (
    <main className="min-h-[calc(100vh-106px)] flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-black">Sign Up</h1>

        <input
          type="text"
          {...register('name', {
            required: '*Vigia! todos os campos são obrigatórios',
            validate: (value) =>
              value.trim().split(' ').length >= 2 ||
              '*Por favor, informe seu nome completo, varão(oa)',
          })}
          placeholder="Nome completo"
          className={`w-full border px-3 py-2 placeholder-gray-400 text-black rounded ${errors.name ? 'border-red-600' : 'border-gray-400'}`}
        />
        {typeof errors.name?.message === 'string' &&
          errors.name.message !== '*Vigia! todos os campos são obrigatórios' && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}

        <input
          type="text"
          {...register('email', {
            required: '*Vigia! todos os campos são obrigatórios',
            pattern: {
              value: /^\S+@\S+$/i,
              message: '*Insira um email válido, irmão(ã)',
            },
          })}
          placeholder="Email"
          className={`w-full border px-3 py-2 placeholder-gray-400 text-black rounded ${errors.email ? 'border-red-600' : 'border-gray-400'}`}
        />
        {typeof errors.email?.message === 'string' && errors.email.message !== '*Vigia! todos os campos são obrigatórios' && (
          <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
        )}

        <Controller
          name="roles"
          control={control}
          rules={{ required: '*Vigia! todos os campos são obrigatórios' }}
          render={({ field }) => (
            <RoleSelector
              selectedRoles={field.value || []}
              onChange={field.onChange}
              hasError={!!errors.roles}
            />
          )}
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            {...register('password', {
              required: '*Vigia! todos os campos são obrigatórios',
              minLength: {
                value: 6,
                message: '*A senha deve conter no mínimo 6 caracteres irmão(a)',
              },
            })}
            placeholder="Senha"
            className={`w-full border px-3 py-2 placeholder-gray-400 text-black rounded pr-10 ${errors.password ? 'border-red-600' : 'border-gray-400'}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            {...register('confirmPassword', {
              required: '*Vigia! todos os campos são obrigatórios',
              validate: (value) => value === watch('password') || '*As senhas não coincidem, irmão',
            })}
            placeholder="Confirme sua senha"
            className={`w-full border px-3 py-2 placeholder-gray-400 text-black rounded pr-10 ${errors.confirmPassword ? 'border-red-600' : 'border-gray-400'}`}
          />
        </div>
        <div className="min-h-[1.25rem] mt-1">
          {typeof errors.confirmPassword?.message === 'string' && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
          {!errors.confirmPassword && typeof errors.password?.message === 'string' && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        {!errors.confirmPassword && !errors.password && Object.values(errors).some(err => typeof err?.message === 'string' && err.message === '*Vigia! todos os campos são obrigatórios') && (
          <p className="text-sm text-red-600 text-center">*Vigia! todos os campos são obrigatórios</p>
        )}

        <button
          type="submit"
          className="w-32 px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition text-center mx-auto block"
        >
          Cadastrar
        </button>

        {loading && (
          <div className="flex justify-center mt-2">
            <LoadingMessage />
          </div>
        )}

        <p className="text-black mt-2 text-center">
          Já está no ministério?{' '}
          <button type="button" onClick={handleGoToLogin} className="text-blue-500 hover:underline">
            Faça login
          </button>
        </p>

      </form>
    </main>
  );
}
