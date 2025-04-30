'use client';

import ProtectedRoute from '@/components/ProtectedRouts';
import { useUser } from '@/contexts/UserContext';
import useIsClient from "@/hooks/useIsClient";
import { AnimatePresence, motion } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function CheckinPage() {
  const { user } = useUser();
  const isAdmin = user?.is_admin;
  const isClient = useIsClient();

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const firstName = user?.name?.split(' ')[0];

  const apiUrl =
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:8080'
      : process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!isAdmin) return;

    const token = localStorage.getItem('token');
    fetch(`${apiUrl}/generate/qr`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          setMessage('Erro ao gerar QR Code.');
          throw new Error('Erro ao gerar QR Code.');
        }
        return res.json();
      })
      .then((data) => {
        if (data?.url) {
          setQrUrl(data.url);
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar QR Code:", err);
        setMessage('Falha ao gerar QR Code. Tente novamente mais tarde.');
      });
  }, [isAdmin]);

  useEffect(() => {
    if (!scanning || !scannerRef.current) return;

    const qrRegionId = 'qr-reader';
    const html5QrCode = new Html5Qrcode(qrRegionId);

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!devices || devices.length === 0) {
          console.warn("Nenhuma câmera disponível ou permissão negada.");
          setMessage("⚠️ Não conseguimos acessar sua câmera. Verifique as permissões do navegador.");
          setLoading(false);
          setScanning(false);
          return;
        }

        html5QrCode
          .start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: 250 },
            async () => {
              setLoading(true);
              await html5QrCode.stop();
              await html5QrCode.clear();
              setLoading(false);
              setScanning(false);
              try {
                const token: string | null = localStorage.getItem('token');
                const apiUrl =
                  typeof window !== 'undefined' && window.location.hostname === 'localhost'
                    ? 'http://localhost:8080'
                    : process.env.NEXT_PUBLIC_API_URL;

                const res = await fetch(`${apiUrl}/checkin`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                });

                let data: { message?: string } = {};
                try {
                  data = await res.json();
                } catch (jsonError) {
                  console.warn('Falha ao interpretar JSON de resposta:', jsonError);
                }

                const successMessage = typeof data === 'object' && 'message' in data && typeof data.message === 'string'
                  ? data.message
                  : '✅ Check-in realizado com sucesso! /br Hora de servir com alegria!';

                setMessage(successMessage);
              } catch (error) {
                setMessage('Erro ao registrar check-in. Tente novamente mais tarde.');
                console.error('Erro ao registrar check-in:', error);
              }
            },
            (errorMessage) => {
              console.warn('QR Error', errorMessage);
            }
          )
          .then(() => {
            setLoading(false);
          })
          .catch((err) => {
            console.error('Erro ao iniciar scanner:', err);
            setScanning(false);
            setLoading(false);
          });
      })
      .catch((err) => {
        console.error('Erro ao acessar câmeras:', err);
        setMessage("⚠️ Não conseguimos acessar sua câmera. Verifique as permissões do navegador.");
        setLoading(false);
        setScanning(false);
      });

    return () => {
      html5QrCode
        .stop()
        .then(() => html5QrCode.clear())
        .catch(console.error);
    };
  }, [scanning]);

  if (!isClient) return null;

  return (
    <ProtectedRoute>
      <AnimatePresence>
        <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center w-full space-y-6"
          >
            <h1 className="text-3xl font-bold text-black">{firstName}, registre seu check-in!</h1>
            <p className="text-lg text-gray-600 text-center">
              {isAdmin
                ? "Aqui está o QR Code do culto. Compartilhe com os voluntários."
                : "Clique no ícone de câmera e escaneie o QR Code."}
            </p>

            {isAdmin ? (
              qrUrl ? (
                <>
                  <img
                    src={qrUrl}
                    alt="QR Code do dia"
                    className="w-64 h-64 object-contain rounded shadow-md bg-white p-4"
                  />
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      const res = await fetch(`${apiUrl}/generate/qr/reset`, {
                        method: 'POST',
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      });

                      if (res.ok) {
                        const data = await res.json();
                        setMessage(data.message || 'QR Code resetado!');
                        // Recarrega o novo QR após reset
                        fetch(`${apiUrl}/generate/qr`, {
                          headers: { Authorization: `Bearer ${token}` },
                        })
                          .then(res => res.json())
                          .then(data => setQrUrl(data.url));
                      } else {
                        setMessage('Falha ao resetar QR Code.');
                      }
                    }}
                    className="mt-4 text-sm text-blue-600 underline"
                  >
                    🔄 Gerar novo QR Code
                  </button>
                </>
              ) : (
                <p className="text-gray-500 text-sm">Carregando QR Code...</p>
              )
            ) : !scanning ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setScanning(true);
                  setLoading(true);
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-700 transition flex items-center"
              >
                <Camera className="mr-2" size={24} />
                Escanear QR Code
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full text-black text-center max-w-sm"
              >
                <div ref={scannerRef} id="qr-reader" className="w-full" />
                <button
                  onClick={() => setScanning(false)}
                  className="mt-4 text-base text-red-500 underline"
                >
                  Bater em retirada ❌
                </button>
              </motion.div>
            )}

            {loading && scanning && !isAdmin && (
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="text-gray-500 text-sm"
              >
                Pelejando...
              </motion.p>
            )}

            {message && (
              <motion.p
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-blue-600 font-medium text-center"
              >
                {message}
              </motion.p>
            )}
          </motion.div>
        </main>
      </AnimatePresence>
    </ProtectedRoute>
  );
}