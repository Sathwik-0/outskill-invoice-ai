'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Camera, FileText, ShieldCheck, Upload } from 'lucide-react';
import { toast } from 'sonner';
import AIOrchestration, { OrchestrationStage } from '@/components/ai/AIOrchestration';
import { cn } from '@/lib/utils/helpers';

const STAGES: OrchestrationStage[] = [
  { id: 'upload', label: 'Uploading invoice...', detail: 'Securing file and preparing extraction context.', status: 'waiting' },
  { id: 'extract', label: 'Extracting invoice text...', detail: 'Reading customer, amount, invoice number, and due date.', status: 'waiting' },
  { id: 'customer', label: 'Detecting customer information...', detail: 'Identifying who owes money and why.', status: 'waiting' },
  { id: 'payment', label: 'Analyzing payment status...', detail: 'Checking due date and follow-up priority.', status: 'waiting' },
  { id: 'ledger', label: 'Updating ledger...', detail: 'Creating a pending collection entry.', status: 'waiting' },
  { id: 'reminder', label: 'Generating payment reminder...', detail: 'Drafting a polite WhatsApp-ready follow-up.', status: 'waiting' },
];

export default function UploadZone() {
  const router = useRouter();
  const [stages, setStages] = useState<OrchestrationStage[]>(STAGES);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [description, setDescription] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  const setStage = (id: string, status: OrchestrationStage['status']) => {
    setStages(prev => prev.map(stage => stage.id === id ? { ...stage, status } : stage));
  };

  const processUpload = useCallback(async (file?: File, desc?: string) => {
    if (file && file.size > 10 * 1024 * 1024) {
      toast.error('Invoice is too large', { description: 'Please upload a photo or PDF below 10 MB.' });
      return;
    }

    setProcessing(true);
    setDone(false);
    setStages(STAGES.map(stage => ({ ...stage, status: 'waiting' })));

    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      if (desc) formData.append('description', desc);

      setStage('upload', 'processing');
      await delay(350);

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 30000);
      const res = await fetch('/api/invoices', { method: 'POST', body: formData, signal: controller.signal });
      window.clearTimeout(timeout);
      setStage('upload', 'done');

      setStage('extract', 'processing');
      await delay(520);
      setStage('extract', 'done');

      setStage('customer', 'processing');
      await delay(380);
      setStage('customer', 'done');

      setStage('payment', 'processing');
      await delay(380);
      setStage('payment', 'done');

      const { data, error } = await safeJson(res);
      if (error || !data) throw new Error(error ?? 'Upload failed. Please try again.');

      setStage('ledger', 'processing');
      await delay(380);
      setStage('ledger', 'done');

      setStage('reminder', 'processing');
      const reminderRes = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: data.id }),
      });
      const reminderJson = await safeJson(reminderRes);
      if (reminderJson.error) {
        toast.warning('Invoice filed. Reminder can be generated later.', {
          description: 'The AI reminder service did not respond in time.',
        });
      }
      setStage('reminder', 'done');

      setDone(true);
      toast.success(`Invoice from ${data.customer_name} processed`, {
        description: 'Ledger updated and WhatsApp reminder prepared.',
      });

      await delay(1200);
      router.refresh();
      resetState();
    } catch (err) {
      const message = err instanceof DOMException && err.name === 'AbortError'
        ? 'Processing took too long. Please try again.'
        : err instanceof Error
          ? err.message
          : 'Something went wrong. Please retry.';
      toast.error('AI workflow paused', { description: message });
      setStages(prev => prev.map(stage => stage.status === 'processing' ? { ...stage, status: 'error' } : stage));
      await delay(1800);
      resetState();
    } finally {
      setProcessing(false);
    }
  }, [router]);

  function resetState() {
    setStages(STAGES.map(stage => ({ ...stage, status: 'waiting' })));
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
      <AIOrchestration
        stages={stages}
        title="AI invoice operations running"
        subtitle="Upload, extraction, ledger update, and reminder generation are coordinated in one smooth flow."
        completeLabel="AI processing complete"
      />
    );
  }

  if (showTextInput) {
    return (
      <div className="rounded-2xl border border-sage-100 bg-white p-5 shadow-sm shadow-sage-100/60">
        <h3 className="mb-3 font-medium text-sage-800">Describe the invoice</h3>
        <textarea
          value={description}
          onChange={event => setDescription(event.target.value)}
          placeholder="e.g. Invoice from Ramesh Traders for Rs 4,500 worth of rice bags, due on 30 May"
          className="h-24 w-full resize-none rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
        />
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => description.trim() && processUpload(undefined, description)}
            disabled={!description.trim()}
            className="flex-1 rounded-lg bg-sage-500 py-2 text-sm font-medium text-white transition-colors hover:bg-sage-600 disabled:opacity-40"
          >
            Process with AI
          </button>
          <button
            onClick={() => setShowTextInput(false)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          'group rounded-2xl border-2 border-dashed p-7 text-center shadow-sm shadow-sage-100/50 transition-all sm:p-10',
          processing ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
          isDragActive
            ? 'border-sage-400 bg-sage-50'
            : 'border-sage-200 bg-white hover:border-sage-300 hover:bg-sage-50/70'
        )}
      >
        <input {...getInputProps()} />
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-100 transition-transform group-hover:scale-105">
          <Upload size={24} className="text-sage-500" />
        </div>
        <p className="mb-1 text-lg font-medium text-sage-800">
          {isDragActive ? 'Drop invoice here' : 'Upload invoice'}
        </p>
        <p className="text-sm text-gray-400">
          Drag and drop a photo or PDF. AI handles the bookkeeping.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-sage-100 bg-sage-50 px-3 py-1 text-xs font-medium text-sage-700">
          <ShieldCheck size={13} />
          Extracts, files, and prepares reminder
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-sage-100 bg-white py-3 text-sm font-medium text-sage-700 transition-colors hover:bg-sage-50">
          <Camera size={16} />
          Take photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={event => event.target.files?.[0] && processUpload(event.target.files[0])}
          />
        </label>
        <button
          onClick={() => setShowTextInput(true)}
          className="flex items-center justify-center gap-2 rounded-xl border border-sage-100 bg-white py-3 text-sm font-medium text-sage-700 transition-colors hover:bg-sage-50"
        >
          <FileText size={16} />
          Describe invoice
        </button>
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function safeJson(res: Response) {
  try {
    const json = await res.json();
    if (!res.ok && !json.error) return { error: 'Request failed. Please try again.' };
    return json;
  } catch {
    return { error: 'Unexpected server response. Please retry.' };
  }
}
