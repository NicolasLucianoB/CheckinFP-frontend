'use client';

import ProtectedRoute from '@/components/ProtectedRouts';
import PunctualityMeter from '@/components/PunctualityMeter';
import RankingChart from '@/components/RankingChart';
import RolesChart from '@/components/RolesChart';
import TimeScatterChart from '@/components/TimeScatterChart';
import { AnimatePresence, motion } from 'framer-motion';

export default function PerformancePage() {
  return (
    <ProtectedRoute>
      <AnimatePresence>
        <main className="min-h-[calc(100vh-106px)] flex flex-col items-center justify-center bg-gray-100 p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            <h1 className="text-3xl font-bold text-black text-center mb-8">Gráficos e Rankings</h1>
            <RankingChart />
            <div className="h-2" />
            <RolesChart />
            <div className="h-2" />
            <PunctualityMeter />
            <div className="h-2" />
            <TimeScatterChart />
          </motion.div>
        </main>
      </AnimatePresence>
    </ProtectedRoute>
  );
}