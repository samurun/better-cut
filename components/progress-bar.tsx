'use client';

import type { AppStatus } from '@/lib/types';

type ProgressState = {
  color: string;
  label: string;
  progress: number;
};

const STATUS_MAP: Record<Exclude<AppStatus, 'idle'>, ProgressState> = {
  uploading: { label: 'กำลังอัปโหลด...', color: 'bg-primary', progress: 25 },
  queued: { label: 'อยู่ในคิว...', color: 'bg-primary/70', progress: 40 },
  processing: {
    label: 'กำลัง Transcribe...',
    color: 'bg-primary',
    progress: 70,
  },
  completed: { label: 'เสร็จสิ้น!', color: 'bg-primary', progress: 100 },
  error: { label: 'เกิดข้อผิดพลาด', color: 'bg-destructive', progress: 100 },
};

const FALLBACK_STATE: ProgressState = {
  label: 'กำลังเตรียม...',
  color: 'bg-muted-foreground',
  progress: 50,
};

interface ProgressBarProps {
  status: Exclude<AppStatus, 'idle'>;
}

export default function ProgressBar({ status }: ProgressBarProps) {
  const current = STATUS_MAP[status] ?? FALLBACK_STATE;

  return (
    <div className='w-full'>
      <div className='flex justify-between mb-1'>
        <span className='text-sm font-medium text-foreground'>
          {current.label}
        </span>
        <span className='text-sm text-muted-foreground'>
          {current.progress}%
        </span>
      </div>
      <div className='w-full bg-secondary rounded-full h-2.5'>
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${current.color}`}
          style={{ width: `${current.progress}%` }}
        />
      </div>
    </div>
  );
}
