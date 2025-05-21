'use client';

import LoadingMessage from '@/components/LoadingMessage';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

type UserProfile = {
  name: string;
  email: string;
  role: string;
  photo_url?: string;
};

export default function ProfilePage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<UserProfile | null>(null);
  const [photo, setPhoto] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<UserProfile & { password?: string }>();

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
          role: data.role,
        });
        setPhoto(data.photo_url || '');
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Erro desconhecido');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reset, API_URL]);

  const onSubmit = async (values: UserProfile & { password?: string }) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ ...values, photo_url: photo }),
      });

      const result = await res.json();
      setIsLoading(false);
      if (!res.ok) {
        throw new Error(result.message || 'Erro ao atualizar perfil');
      }
      toast.success('Perfil atualizado com sucesso');
    } catch (error: unknown) {
      setIsLoading(false);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro desconhecido');
      }
    }
  };

  if (loading) return <p className="p-8 text-sm">Carregando perfil...</p>;

  return (
    <main className="min-h-[calc(100vh-106px)] flex flex-col items-center justify-center bg-gray-100 p-6 space-y-6">
      {isLoading && <LoadingMessage />}
      <h1 className="text-2xl font-bold mb-6 text-gray-700">Meu Perfil</h1>

      <div className="relative w-28 h-28 mb-4 flex items-center justify-center">
        <Image
          src={photo || '/assets/logo.png'}
          alt="Foto de perfil"
          fill
          className="rounded-full object-cover border shadow"
        />
        <button
          className="absolute bottom-1 right-1 bg-white border rounded-full p-1 shadow hover:bg-gray-100"
          title="Editar foto de perfil"
          onClick={() => fileInputRef.current?.click()}
        >
          <PencilSquareIcon className="w-4 h-4 text-gray-600" />
        </button>
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
            formData.append('upload_preset', 'checkinfp'); // nome do seu preset
            formData.append('folder', 'profiles');

            toast.loading('Enviando imagem...');
            try {
              const res = await fetch(`https://api.cloudinary.com/v1_1/dwvrcpasa/image/upload`, {
                method: 'POST',
                body: formData,
              });
              const data = await res.json();
              if (data.secure_url) {
                setPhoto(data.secure_url);
                toast.dismiss();
                toast.success('Foto atualizada!');
              } else {
                throw new Error('Erro ao enviar imagem');
              }
            } catch {
              toast.dismiss();
              toast.error('Falha no upload');
            }
          }}
        />
      </div>
      <p className="text-sm mt-2 text-gray-600 text-center">Foto de perfil</p>

      <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full flex flex-col items-center">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-500">Nome completo</label>
          <input
            type="text"
            {...register('name')}
            className="border border-gray-400 text-gray-700 placeholder-gray-500 px-3 py-2 rounded w-80 max-w-full"
            placeholder="João da Silva"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-500">Email</label>
          <input
            type="email"
            {...register('email')}
            className="border border-gray-400 text-gray-700 placeholder-gray-500 px-3 py-2 rounded w-80 max-w-full"
            placeholder="email@exemplo.com"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-500">Função no ministério</label>
          <input
            type="text"
            {...register('role')}
            className="border border-gray-400 text-gray-700 placeholder-gray-500 px-3 py-2 rounded w-80 max-w-full"
            placeholder="Projeção, Câmera, etc"
          />
        </div>

        <div className="flex gap-4 mt-6 justify-center">
          <button
            type="button"
            onClick={() => {
              reset({
                name: initialData?.name || '',
                email: initialData?.email || '',
                role: initialData?.role || '',
              });
              setPhoto(initialData?.photo_url || '');
              toast.success('Alterações descartadas');
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
    </main>
  );
}
