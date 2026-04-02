'use client';

import { Segment, toSRT, toVTT } from '@/lib/subtitle';
import { Button } from '@/components/ui/button';

interface ExportButtonsProps {
  segments: Segment[];
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportButtons({ segments }: ExportButtonsProps) {
  return (
    <div className='flex gap-3'>
      <Button
        onClick={() =>
          downloadFile(toSRT(segments), 'subtitle.srt', 'text/plain')
        }
      >
        ดาวน์โหลด SRT
      </Button>
      <Button
        onClick={() =>
          downloadFile(toVTT(segments), 'subtitle.vtt', 'text/vtt')
        }
      >
        ดาวน์โหลด VTT
      </Button>
    </div>
  );
}
