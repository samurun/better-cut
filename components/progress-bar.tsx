'use client';

import type { AppStatus } from '@/lib/types';

const STATUS_MAP: Record<
  Exclude<AppStatus, 'idle'>,
  { label: string; color: string }
> = {
  processing: { label: 'กำลัง Transcribe...', color: 'bg-primary' },
  completed: { label: 'เสร็จสิ้น', color: 'bg-primary' },
  error: { label: 'เกิดข้อผิดพลาด', color: 'bg-destructive' },
};

interface ProgressBarProps {
  status: Exclude<AppStatus, 'idle'>;
}

export default function ProgressBar({ status }: ProgressBarProps) {
  const current = STATUS_MAP[status];
  const isAnimating = status === 'processing';

  return (
    <div className='w-full' aria-live='polite'>
      <span className='text-[11px] text-muted-foreground mb-1.5 block'>
        {current.label}
      </span>
      <div className='w-full bg-secondary rounded-full h-1 overflow-hidden'>
        <div
          className={`h-1 rounded-full transition-all duration-700 ${current.color} ${
            isAnimating ? 'w-3/4 animate-pulse' : 'w-full'
          }`}
        />
      </div>
    </div>
  );
}
