'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { UploadIcon } from 'lucide-react';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export default function UploadZone({
  onFileSelected,
  disabled,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('video/')) {
        onFileSelected(file);
      }
    },
    [onFileSelected, disabled]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      aria-label='อัปโหลดวิดีโอ'
      className={cn(
        'rounded-lg p-8 text-center transition-colors cursor-pointer',
        'border border-dashed border-border',
        isDragging
          ? 'border-primary/50 bg-primary/5'
          : 'hover:bg-accent/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input
        type='file'
        accept='video/*'
        onChange={handleChange}
        disabled={disabled}
        className='hidden'
        id='video-upload'
      />
      <label
        htmlFor='video-upload'
        className={cn('cursor-pointer', disabled && 'cursor-not-allowed')}
      >
        <UploadIcon className='mx-auto mb-3 size-5 text-muted-foreground' />
        <p className='text-sm text-muted-foreground'>
          ลากวิดีโอมาวาง หรือคลิกเพื่อเลือกไฟล์
        </p>
        <p className='text-xs text-muted-foreground/60 mt-1'>
          MP4, WebM, MOV, AVI, MKV
        </p>
      </label>
    </div>
  );
}
