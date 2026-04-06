'use client';

import { toSRT, toVTT, type Segment } from '@/lib/subtitle';
import { Button } from '@/components/ui/button';
import { DownloadIcon } from 'lucide-react';
import { ButtonGroup } from './ui/button-group';

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
    <div className='flex gap-1.5 lg:flex-col'>
      <ButtonGroup className='w-full'>
        <Button
          variant='secondary'
          className='lg:w-1/2 justify-center'
          onClick={() =>
            downloadFile(toSRT(segments), 'subtitle.srt', 'text/plain')
          }
        >
          <DownloadIcon className='size-3.5' />
          SRT
        </Button>
        <Button
          variant='secondary'
          className='lg:w-1/2 justify-center'
          onClick={() =>
            downloadFile(toVTT(segments), 'subtitle.vtt', 'text/vtt')
          }
        >
          <DownloadIcon className='size-3.5' />
          VTT
        </Button>
      </ButtonGroup>
    </div>
  );
}
