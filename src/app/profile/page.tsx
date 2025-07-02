'use client';

import History from '@/components/History';
import LoadingMessage, { AppLoading } from '@/components/LoadingMessage';
import ProtectedRoute from '@/components/ProtectedRouts';
import { useUser } from '@/contexts/UserContext';
import { ArrowUturnLeftIcon, PencilSquareIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import RoleSelector from '@/components/RoleSelector';

type UserProfile = {
  name: string;
  email: string;
  roles: string[];
  photo_url?: string;
  password?: string;
};

export default function ProfilePage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  const { user, setUser } = useUser();

  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<UserProfile | null>(null);
  const [photo, setPhoto] = useState<string>('');
  const [message, setMessage] = useState('');
  const [photoMessage, setPhotoMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLDivElement | null>(null);
  const confirmPasswordRef = useRef<HTMLDivElement | null>(null);

  const [showMessage, setShowMessage] = useState(false);
  const [showPhotoMessage, setShowPhotoMessage] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('.image-menu')) {
        setShowImageMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    resetField,
    clearErrors,
    setError,
    control,
    formState: { errors, isSubmitted },
    watch,
  } = useForm<UserProfile & { password?: string; confirmPassword?: string }>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    criteriaMode: 'all',
    shouldFocusError: true,
    defaultValues: {
      roles: [],
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        passwordRef.current &&
        confirmPasswordRef.current &&
        !passwordRef.current.contains(event.target as Node) &&
        !confirmPasswordRef.current.contains(event.target as Node) &&
        !watch('password') &&
        !watch('confirmPassword')
      ) {
        setIsPasswordTouched(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [watch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Erro ao buscar dados do perfil');
        const data = await res.json();
        setInitialData(data);
        reset({
          name: data.name,
          email: data.email,
          roles: data.roles || [],
          password: data.password,
        });
        setPhoto(data.photo_url || '');
      } catch (error: unknown) {
        if (error instanceof Error) {
          setMessage(error.message);
        } else {
          setMessage('Erro desconhecido');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reset, API_URL]);

  useEffect(() => {
    if (message) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowMessage(false);
    }
  }, [message]);

  useEffect(() => {
    if (photoMessage) {
      setShowPhotoMessage(true);
      const timer = setTimeout(() => setShowPhotoMessage(false), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowPhotoMessage(false);
    }
  }, [photoMessage]);

  const onSubmit = async (values: UserProfile & { password?: string; confirmPassword?: string }) => {
    // Debug logs before updatedFields
    console.log('Valores do formulário recebidos no submit:', values);
    console.log('Roles enviadas no update:', values.roles);
    setMessage('');
    const updatedFields: Partial<UserProfile & { password?: string }> = {};
    if (values.name !== initialData?.name) updatedFields.name = values.name;
    if (values.email !== initialData?.email) updatedFields.email = values.email;
    // Sempre incluir roles, removendo a lógica de comparação temporariamente
    updatedFields.roles = values.roles;
    if (values.password) updatedFields.password = values.password;
    if (photo !== initialData?.photo_url) updatedFields.photo_url = photo;
    // Log após montagem de updatedFields
    console.log('Campos atualizados que serão enviados:', updatedFields);

    const noChanges =
      values.name === initialData?.name &&
      values.email === initialData?.email &&
      JSON.stringify(values.roles || []) === JSON.stringify(initialData?.roles || []) &&
      photo === initialData?.photo_url &&
      !values.password;

    if (noChanges) {
      setIsLoading(false);
      setTimeout(() => {
        setMessage('Nenhuma alteração detectada.');
      }, 50);
      return;
    }

    try {
      setMessage('');
      setIsLoading(true);
      const res = await fetch(`${API_URL}/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedFields),
      });

      const result = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        console.log('Erro na resposta do backend:', result);
        if (result.message?.toLowerCase().includes('email')) {
          setError('email', { type: 'server', message: '*E-mail já cadastrado, irmão(ã)' });
          return;
        }
        throw new Error(result.message || 'Erro ao atualizar perfil');
      }
      setMessage('Perfil atualizado com sucesso');
      setInitialData({
        name: values.name,
        email: values.email,
        roles: values.roles,
        password: values.password,
        photo_url: photo,
      });
      setUser((prev) => prev ? { ...prev, avatarUrl: photo } : null);
    } catch (error: unknown) {
      setIsLoading(false);
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage('Erro desconhecido ao atualizar perfil');
      }
    }
  };

  if (loading) return < AppLoading />;

  return (
    <ProtectedRoute>
      <AnimatePresence>
        <main className="min-h-[calc(100vh-106px)] flex flex-col items-center justify-center bg-gray-100 p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center w-full"
          >
            <h1 className="text-2xl font-bold mb-2 text-gray-700">Meu Perfil</h1>

            <motion.p
              initial={{ scale: 0.9, opacity: 0 }}
              animate={showMessage ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className={`text-center text-sm font-medium ${message.includes('sucesso')
                ? 'text-green-600'
                : 'text-red-600'
                }`}
            >
              {message}
            </motion.p>

            <div
              className="relative w-32 h-32 rounded-full p-[3.5px] shadow mb-1"
              style={{
                background: 'conic-gradient(from 225deg, #28B242 0%, #80C447 5%, #FEA341 25%, #FEA341 38%, #FEA341 40%,rgb(248, 79, 141) 50%, #FE2674 62%, #3EA7E0 70%, #3EA7E0 90%, #28B242 100%)'
              }}
            >
              <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                <Image
                  src={photo || '/assets/logo.png'}
                  alt=""
                  width={112}
                  height={112}
                  className="w-28 h-28 object-cover rounded-full"
                />
              </div>
              <button
                className="absolute bottom-1 right-1 bg-white border rounded-full p-1 shadow hover:bg-gray-100 z-20"
                title="Editar foto de perfil"
                onClick={() => {
                  if (!photo) {
                    fileInputRef.current?.click();
                  } else {
                    setShowImageMenu((prev) => !prev);
                  }
                }}
              >
                <PencilSquareIcon className="w-4 h-4 text-gray-600" />
              </button>
              {showImageMenu && (
                <div className="image-menu absolute z-10 top-full mt-2 right-0 bg-white border rounded shadow-lg text-sm w-40">
                  <button
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 text-black flex items-center gap-2 whitespace-nowrap"
                    onClick={() => {
                      setShowImageMenu(false);
                      fileInputRef.current?.click();
                    }}
                  >
                    <PhotoIcon className="w-5 h-5 text-gray-700" /> Alterar imagem
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 text-black flex items-center gap-2 whitespace-nowrap"
                    onClick={() => {
                      setPhoto('');
                      setPhotoMessage('');
                      setTimeout(() => setPhotoMessage('Foto removida.'), 10);
                      setShowImageMenu(false);
                    }}
                  >
                    <TrashIcon className="w-5 h-5 text-red-500" /> Remover imagem
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('upload_preset', 'checkinfp');
                  formData.append('folder', 'profiles');

                  setPhotoMessage('');
                  setTimeout(() => setPhotoMessage('Enviando imagem...'), 10);
                  try {
                    const res = await fetch(`https://api.cloudinary.com/v1_1/dwvrcpasa/image/upload`, {
                      method: 'POST',
                      body: formData,
                    });
                    const data = await res.json();
                    if (data.secure_url) {
                      setPhoto(data.secure_url);
                      setPhotoMessage('');
                    } else {
                      throw new Error('Erro ao enviar imagem');
                    }
                  } catch {
                    setPhotoMessage('');
                    setTimeout(() => setPhotoMessage('Falha no upload da foto'), 10);
                  } finally {
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }
                }}
              />
            </div>
            <p className="text-sm mt-1 mb-3 text-gray-600 text-center flex flex-col items-center">
              Foto de perfil
            </p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={showPhotoMessage ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center text-sm text-gray-700 mt-1"
            >
              {photoMessage}
            </motion.p>

            <form
              id="profile-form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 w-full flex flex-col items-center"
              noValidate
            >
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-500">Nome completo</label>
                <input
                  type="text"
                  {...register('name', {
                    required: '*Vigia! todos os campos são obrigatórios',
                    validate: (value) => {
                      const isComplete = value.trim().split(' ').length >= 2;
                      return isSubmitted ? (isComplete || '*Por favor, informe seu nome completo, varão(oa)') : true;
                    },
                  })}
                  className={`border px-3 py-2 rounded w-80 max-w-full placeholder-gray-500 text-gray-700 ${errors.name ? 'border-red-600' : 'border-gray-400'}`}
                  placeholder="João da Silva"
                  required
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-500">Email</label>
                <input
                  type="email"
                  {...register('email', {
                    required: '*Vigia! todos os campos são obrigatórios',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: '*Insira um email válido, irmão(ã)',
                    },
                  })}
                  className={`border px-3 py-2 rounded w-80 max-w-full placeholder-gray-500 text-gray-700 ${errors.email ? 'border-red-600' : 'border-gray-400'}`}
                  placeholder="email@exemplo.com"
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="w-80 max-w-full">
                <label className="block mb-1 text-sm font-medium text-gray-500">Funções no ministério</label>
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
                {errors.roles && (
                  <p className="text-sm text-red-600 mt-1">{errors.roles.message}</p>
                )}
              </div>

              <div className="relative" ref={passwordRef}>
                <div className="flex items-center justify-between">
                  <label className="block mb-1 text-sm font-medium text-gray-500">Alterar senha</label>
                  {isPasswordTouched && (
                    <ArrowUturnLeftIcon
                      className="w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-800"
                      onClick={() => {
                        setIsPasswordTouched(false);
                        resetField('password');
                        resetField('confirmPassword');
                      }}
                    />
                  )}
                </div>

                <input
                  type={showPassword ? 'text' : 'password'}
                  readOnly={!isPasswordTouched}
                  {...register('password', {
                    minLength: {
                      value: 6,
                      message: '*A senha deve conter no mínimo 6 caracteres irmão(a)',
                    },
                  })}
                  className={`border px-3 py-2 rounded w-80 max-w-full pr-10 placeholder-gray-500 text-gray-700 ${errors.password ? 'border-red-600' : 'border-gray-400'}`}
                  placeholder="********"
                />

                <div className="absolute right-2 top-8.5">
                  {!isPasswordTouched ? (
                    <PencilSquareIcon
                      className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-800"
                      onClick={() => setIsPasswordTouched(true)}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div
                ref={confirmPasswordRef}
                className={`transition-all duration-300 ${isPasswordTouched ? 'block' : 'hidden'} w-80 max-w-full`}
              >
                <label className="block mb-1 text-sm font-medium text-gray-500">Confirmar nova senha</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    validate: (value) => value === watch('password') || '*As senhas não coincidem, irmão(ã)',
                  })}
                  className={`border px-3 py-2 rounded w-full pr-10 placeholder-gray-500 text-gray-700 ${errors.confirmPassword ? 'border-red-600' : 'border-gray-400'}`}
                  placeholder="********"
                />
                <div className="min-h-[1.25rem] mt-1">
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                  {!errors.confirmPassword && errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </div>

              {isLoading && (
                <div className="mb-4">
                  <LoadingMessage />
                </div>
              )}
              <div className="flex gap-4 mt-6 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    reset({
                      name: initialData?.name || '',
                      email: initialData?.email || '',
                      roles: initialData?.roles || [],
                      password: '',
                      confirmPassword: '',
                    });
                    clearErrors();
                    setPhoto(initialData?.photo_url || '');
                    setMessage('');
                    setIsPasswordTouched(false);
                  }}
                  className="w-32 px-6 py-2 rounded bg-red-400 hover:bg-red-500 text-white font-medium transition text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-32 px-6 py-2 rounded text-white font-medium transition text-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  Salvar
                </button>
              </div>
            </form>
            {/* Renderização condicional do histórico para admin */}
            {user?.is_admin && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-5xl mt-12"
              >
                <History />
              </motion.div>
            )}
          </motion.div>
        </main>
      </AnimatePresence>
    </ProtectedRoute>
  );
}
