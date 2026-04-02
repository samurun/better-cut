'use client';

interface ProgressBarProps {
  status: string;
}

export default function ProgressBar({ status }: ProgressBarProps) {
  const statusMap: Record<
    string,
    { label: string; color: string; progress: number }
  > = {
    uploading: { label: 'กำลังอัปโหลด...', color: 'bg-primary', progress: 25 },
    queued: { label: 'อยู่ในคิว...', color: 'bg-primary/70', progress: 40 },
    processing: {
      label: 'กำลัง Transcribe...',
      color: 'bg-primary',
      progress: 70,
    },
    completed: { label: 'เสร็จสิ้น!', color: 'bg-green-600', progress: 100 },
    error: { label: 'เกิดข้อผิดพลาด', color: 'bg-destructive', progress: 100 },
  };

  const current = statusMap[status] || {
    label: status,
    color: 'bg-muted-foreground',
    progress: 50,
  };

  return (
    <div className='w-full'>
      <div className='flex justify-between mb-1'>
        <span className='text-sm font-medium text-foreground'>
          {current.label}
        </span>
        <span className='text-sm text-muted-foreground'>{current.progress}%</span>
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
