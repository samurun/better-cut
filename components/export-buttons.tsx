'use client';

import { toSRT, toVTT, type Segment } from '@/lib/subtitle';
import { Button } from '@/components/ui/button';
import { DownloadIcon } from 'lucide-react';

interface ExportButtonsProps {
  segments: Segment[];
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

export default function ExportButtons({ segments }: ExportButtonsProps) {
  return (
    <div className='flex gap-3'>
      <Button
        onClick={() =>
          downloadFile(toSRT(segments), 'subtitle.srt', 'text/plain')
        }
      >
        <DownloadIcon data-icon='inline-start' />
        ดาวน์โหลด SRT
      </Button>
      <Button
        onClick={() =>
          downloadFile(toVTT(segments), 'subtitle.vtt', 'text/vtt')
        }
      >
        <DownloadIcon data-icon='inline-start' />
        ดาวน์โหลด VTT
      </Button>
    </div>
  );
}
