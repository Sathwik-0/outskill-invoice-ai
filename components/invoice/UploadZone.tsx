'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Camera, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/helpers';
import { useRouter } from 'next/navigation';

type Stage = { label: string; status: 'waiting' | 'processing' | 'done' | 'error' };

const STAGES: Stage[] = [
  { label: 'Uploading invoice…', status: 'waiting' },
  { label: 'AI extracting data…', status: 'waiting' },
  { label: 'Updating ledger…', status: 'waiting' },
  { label: 'Generating reminder…', status: 'waiting' },
];

export default function UploadZone() {
  const router = useRouter();
  const [stages, setStages] = useState<Stage[]>(STAGES);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [description, setDescription] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  const setStage = (index: number, status: Stage['status']) => {
    setStages(prev => prev.map((s, i) => i === index ? { ...s, status } : s));
  };

  const processUpload = useCallback(async (file?: File, desc?: string) => {
    setProcessing(true);
    setDone(false);
    setStages(STAGES.map(s => ({ ...s, status: 'waiting' })));

    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      if (desc) formData.append('description', desc);

      // Stage 1: Upload
      setStage(0, 'processing');
      await delay(400);

      const res = await fetch('/api/invoices', { method: 'POST', body: formData });
      setStage(0, 'done');

      // Stage 2: AI
      setStage(1, 'processing');
      await delay(600);
      setStage(1, 'done');

      // Stage 3: Ledger
      setStage(2, 'processing');
      await delay(400);
      setStage(2, 'done');

      // Stage 4: Reminder
      setStage(3, 'processing');

      const { data, error } = await res.json();
      if (error || !data) throw new Error(error ?? 'Upload failed');

      // Auto-generate reminder
      await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: data.id }),
      });

      setStage(3, 'done');
      setDone(true);
      toast.success(`Invoice from ${data.customer_name} processed!`);

      await delay(1200);
      router.refresh();
      resetState();
    } catch (err) {
      const msg = (err as Error).message;
      toast.error(msg);
      setStages(prev => prev.map(s => s.status === 'processing' ? { ...s, status: 'error' } : s));
      await delay(2000);
      resetState();
    } finally {
      setProcessing(false);
    }
  }, [router]);

  function resetState() {
    setStages(STAGES.map(s => ({ ...s, status: 'waiting' })));
    setDone(false);
    setDescription('');
    setShowTextInput(false);
  }

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) processUpload(files[0]);
  }, [processUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] },
    maxFiles: 1,
    disabled: processing,
  });

  if (processing || done) {
    return (
      <div className="bg-white border border-sage-100 rounded-2xl p-6">
        <div className="space-y-3">
          {stages.map((stage, i) => (
            <div key={i} className={cn('flex items-center gap-3 text-sm transition-all', stage.status === 'waiting' && 'opacity-30')}>
              <div className="w-5 h-5 flex-shrink-0">
                {stage.status === 'waiting' && <div className="w-4 h-4 border-2 border-gray-200 rounded-full mt-0.5" />}
                {stage.status === 'processing' && <Loader2 size={16} className="animate-spin text-sage-500 mt-0.5" />}
                {stage.status === 'done' && <CheckCircle2 size={16} className="text-sage-500 mt-0.5" />}
                {stage.status === 'error' && <AlertCircle size={16} className="text-red-500 mt-0.5" />}
              </div>
              <span className={cn(
                stage.status === 'processing' && 'text-sage-700 font-medium',
                stage.status === 'done' && 'text-gray-500',
                stage.status === 'error' && 'text-red-600',
              )}>
                {stage.label}
              </span>
            </div>
          ))}
        </div>
        {done && (
          <div className="mt-4 text-center text-sage-600 text-sm font-medium animate-fade-up">
            ✓ All done. Invoice filed automatically.
          </div>
        )}
      </div>
    );
  }

  if (showTextInput) {
    return (
      <div className="bg-white border border-sage-100 rounded-2xl p-6">
        <h3 className="font-medium text-sage-800 mb-3">Describe the invoice</h3>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g. Invoice from Ramesh Traders for ₹4,500 worth of rice bags, due on 30 May"
          className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-sage-300"
        />
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => description.trim() && processUpload(undefined, description)}
            disabled={!description.trim()}
            className="flex-1 bg-sage-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-sage-600 disabled:opacity-40 transition-colors"
          >
            Process with AI →
          </button>
          <button onClick={() => setShowTextInput(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg">
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Primary upload drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all',
          isDragActive
            ? 'border-sage-400 bg-sage-50'
            : 'border-sage-200 bg-white hover:border-sage-300 hover:bg-sage-50/50'
        )}
      >
        <input {...getInputProps()} />
        <div className="w-14 h-14 bg-sage-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Upload size={24} className="text-sage-500" />
        </div>
        <p className="text-lg font-medium text-sage-800 mb-1">
          {isDragActive ? 'Drop invoice here' : 'Upload invoice'}
        </p>
        <p className="text-sm text-gray-400">
          Drag & drop a photo or PDF — AI handles the rest
        </p>
      </div>

      {/* Secondary actions */}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center justify-center gap-2 bg-white border border-sage-100 rounded-xl py-3 cursor-pointer hover:bg-sage-50 transition-colors text-sm text-sage-700 font-medium">
          <Camera size={16} />
          Take photo
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && processUpload(e.target.files[0])} />
        </label>
        <button
          onClick={() => setShowTextInput(true)}
          className="flex items-center justify-center gap-2 bg-white border border-sage-100 rounded-xl py-3 hover:bg-sage-50 transition-colors text-sm text-sage-700 font-medium"
        >
          <FileText size={16} />
          Describe invoice
        </button>
      </div>
    </div>
  );
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }
