'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

export type OrchestrationStage = {
  id: string;
  label: string;
  detail?: string;
  status: 'waiting' | 'processing' | 'done' | 'error';
};

export default function AIOrchestration({
  stages,
  title = 'AI workflow running',
  subtitle = 'Outskill is reading, organizing, and preparing the next action.',
  completeLabel = 'AI processing complete',
}: {
  stages: OrchestrationStage[];
  title?: string;
  subtitle?: string;
  completeLabel?: string;
}) {
  const doneCount = stages.filter(stage => stage.status === 'done').length;
  const progress = Math.round((doneCount / Math.max(stages.length, 1)) * 100);
  const isComplete = doneCount === stages.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-sage-100 bg-white/90 p-5 shadow-sm shadow-sage-100/70"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-sage-50">
        <motion.div
          className="h-full rounded-r-full bg-gradient-to-r from-sage-400 via-emerald-400 to-amber-300"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      </div>

      <div className="mb-5 flex items-start gap-3 pt-1">
        <motion.div
          animate={{ rotate: isComplete ? 0 : 360 }}
          transition={{ duration: 5, repeat: isComplete ? 0 : Infinity, ease: 'linear' }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-50 text-sage-600 ring-1 ring-sage-100"
        >
          <Sparkles size={18} />
        </motion.div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-sage-900">{isComplete ? completeLabel : title}</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {stages.map((stage, index) => (
          <motion.div
            key={stage.id}
            layout
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            className={cn(
              'flex items-center gap-3 rounded-xl border px-3 py-3 transition-colors',
              stage.status === 'processing' && 'border-sage-200 bg-sage-50/80',
              stage.status === 'done' && 'border-emerald-100 bg-emerald-50/60',
              stage.status === 'waiting' && 'border-gray-100 bg-gray-50/50 opacity-70',
              stage.status === 'error' && 'border-red-100 bg-red-50'
            )}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              {stage.status === 'waiting' && <span className="h-2 w-2 rounded-full bg-gray-300" />}
              {stage.status === 'processing' && <Loader2 size={15} className="animate-spin text-sage-600" />}
              {stage.status === 'done' && <CheckCircle2 size={15} className="text-emerald-600" />}
              {stage.status === 'error' && <AlertCircle size={15} className="text-red-600" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className={cn(
                'text-sm font-medium',
                stage.status === 'processing' && 'text-sage-900',
                stage.status === 'done' && 'text-emerald-800',
                stage.status === 'waiting' && 'text-gray-500',
                stage.status === 'error' && 'text-red-700'
              )}>
                {stage.label}
              </p>
              <AnimatePresence>
                {stage.detail && stage.status === 'processing' && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-0.5 text-xs text-sage-600"
                  >
                    {stage.detail}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
