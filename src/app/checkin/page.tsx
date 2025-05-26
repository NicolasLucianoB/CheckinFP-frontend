'use client';

import LoadingMessage from '@/components/LoadingMessage';
import ProtectedRoute from '@/components/ProtectedRouts';
import { useUser } from '@/contexts/UserContext';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { AlarmClock, Camera } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function CheckinPage() {
  const { user } = useUser();
  const isAdmin = user?.is_admin;
  const firstName = user?.name?.split(' ')[0];

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const scannerRef = useRef<HTMLDivElement>(null);
  const isSubmitting = useRef(false);

  // Adicione estado para mensagem de reset animada:
  const [resetMessage, setResetMessage] = useState('');
  const [showResetMessage, setShowResetMessage] = useState(false);

  const apiUrl =
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:8080'
      : process.env.NEXT_PUBLIC_API_URL;

  const fetchQrCode = useCallback(() => {
    const token = localStorage.getItem('token');
    fetch(`${apiUrl}/generate/qr`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao gerar QR Code.');
        return res.json();
      })
      .then((data) => {
        if (data?.url) setQrUrl(data.url);
        if (typeof data?.expires_at === 'number') {
          setExpiresAt(data.expires_at);
        } else if (typeof data?.expires_in === 'string') {
          const [h, m, s] = data.expires_in.match(/\d+/g)?.map(Number) || [0, 0, 0];
          const fallbackMs = ((h * 3600) + (m * 60) + s) * 1000;
          setExpiresAt(Date.now() + fallbackMs);
        } else {
          setExpiresAt(null);
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar QR Code:", err);
        setMessage('Falha ao gerar QR Code. Tente novamente mais tarde.');
      });
  }, [apiUrl]);
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const diff = Math.max(0, expiresAt - Date.now());
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  useEffect(() => {
    if (isAdmin) fetchQrCode();
  }, [isAdmin, fetchQrCode]);

  useEffect(() => {
    const scanner = scannerRef.current;

    if (!scanning || !scanner) return;

    const qrRegionId = 'qr-reader';
    const html5QrCode = new Html5Qrcode(qrRegionId);

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!devices?.length) {
          setMessage("⚠️ Não conseguimos acessar sua câmera. Verifique as permissões do navegador.");
          setLoading(false);
          setScanning(false);
          return;
        }

        html5QrCode
          .start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: 250 },
            async (decodedText) => {
              if (isSubmitting.current) return;
              isSubmitting.current = true;

              setLoading(true);

              try {
                const tokenParam = new URL(decodedText).searchParams.get("token");
                if (!tokenParam) {
                  setMessage("❌ QR Code inválido ou sem token.");
                  setScanning(false);
                  setLoading(false);
                  if (html5QrCode.getState() === 2) {
                    try {
                      await html5QrCode.stop();
                      await html5QrCode.clear();
                    } catch (err) {
                      console.warn('Erro ao parar scanner:', err);
                    }
                  }
                  return;
                }

                const token = localStorage.getItem('token');
                const res = await fetch(`${apiUrl}/checkin?token=${tokenParam}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                });

                const data = await res.json().catch(() => ({}));

                if (res.ok) {
                  const successMessage = typeof data.message === 'string'
                    ? data.message
                    : '✅ Check-in realizado com sucesso! \nHora de servir com alegria!';
                  setMessage(successMessage);

                  setScanning(false);
                  setLoading(false);

                  if (html5QrCode.getState() === 2) {
                    try {
                      await html5QrCode.stop();
                      await html5QrCode.clear();
                    } catch (err) {
                      console.warn('Erro ao parar scanner:', err);
                    }
                  }

                  return;
                }

                if (res.status === 409) {
                  setMessage('Você já fez o check-in para este culto! 🙌🏽');
                } else {
                  setMessage('Erro ao registrar check-in. Tente novamente mais tarde.');
                }
              } catch (error) {
                console.error('Erro ao registrar check-in:', error);
                setMessage('Erro ao registrar check-in. Tente novamente mais tarde.');
              } finally {
                isSubmitting.current = false;
              }

              setScanning(false);
              setLoading(false);
              if (html5QrCode.getState() === 2) {
                try {
                  await html5QrCode.stop();
                  await html5QrCode.clear();
                } catch (err) {
                  console.warn('Erro ao parar scanner:', err);
                }
              }
            },
            () => { }
          )
          .catch((err) => {
            console.error('Erro ao iniciar scanner:', err);
            setScanning(false);
            setLoading(false);
          });
      })
      .catch((err) => {
        console.error('Erro ao acessar câmera:', err);
        setMessage("⚠️ Varão(oa) não conseguimos acessar sua câmera. Verifique as permissões do navegador.");
        setScanning(false);
        setLoading(false);
      });

    return () => {
      if (html5QrCode.getState() === 2) {
        (async () => {
          try {
            await html5QrCode.stop();
            await html5QrCode.clear();
          } catch (err) {
            console.warn('Erro ao parar scanner:', err);
          }
        })();
      }
      if (scanner) {
        scanner.innerHTML = '';
      }
    };
  }, [scanning, apiUrl]);

  return (
    <ProtectedRoute>
      <AnimatePresence>
        <main className="min-h-[calc(100vh-106px)] flex flex-col items-center justify-center bg-gray-100 p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center w-full space-y-6"
          >
            <h1 className="text-3xl font-bold text-black">
              {isAdmin ? 'Registre seu check-in!' : `${firstName}, registre seu check-in!`}
            </h1>
            {isAdmin ? (
              <p className="text-lg text-gray-600 text-center">
                Aqui está o QR Code do culto, compartilhe com os voluntários.
              </p>
            ) : (
              !scanning && (
                <p className="text-lg text-gray-600 text-center">
                  Clique no ícone de câmera e escaneie o QR Code.
                </p>
              )
            )}

            {isAdmin ? (
              qrUrl ? (
                <>
                  <Image
                    src={qrUrl}
                    alt="QR Code do dia"
                    width={256}
                    height={256}
                    className="object-contain rounded shadow-md bg-white p-4"
                  />
                  {countdown && (
                    <p className="text-sm text-black mt-2 flex items-center font-medium">
                      <AlarmClock className="w-5 h-5 mr-2" />
                      Expira em <span className="text-red-600 ml-1">{countdown}</span>
                    </p>
                  )}
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      const res = await fetch(`${apiUrl}/generate/qr/reset`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                      });

                      if (res.ok) {
                        const data = await res.json();
                        setResetMessage(data.message || 'QR Code resetado!');
                        setShowResetMessage(true);
                        setTimeout(() => {
                          setShowResetMessage(false);
                        }, 1500);
                        setTimeout(() => {
                          fetchQrCode();
                        }, 1000);
                      } else {
                        setMessage('Falha ao resetar QR Code.');
                      }
                    }}
                    className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded shadow hover:bg-blue-200 transition flex items-center"
                  >
                    <ArrowPathIcon className="w-5 h-5 mr-2 inline-block" />
                    Gerar novo QR Code
                  </button>
                  <AnimatePresence>
                    {showResetMessage && (
                      <motion.p
                        key="reset-message"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{
                          opacity: { duration: 0.6, ease: "easeInOut" },
                          y: { duration: 0.6, ease: "easeInOut" },
                        }}
                        className="text-green-600 font-medium mt-2"
                      >
                        {resetMessage}
                      </motion.p>
                    )}
                  </AnimatePresence>
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
                  className="mt-4 text-base text-red-500 underline flex items-center justify-center mx-auto"
                >
                  <XMarkIcon className="w-5 h-5 mr-2 text-red-500" />
                  Bater em retirada
                </button>
              </motion.div>
            )}


            {loading && scanning && !isAdmin ? (
              <LoadingMessage />
            ) : message && (
              <motion.p
                style={{ whiteSpace: 'pre-line' }}
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