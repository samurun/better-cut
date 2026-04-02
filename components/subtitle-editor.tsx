'use client';

import { Segment } from '@/lib/subtitle';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import ExportButtons from './export-buttons';
import { Textarea } from './ui/textarea';

interface SubtitleEditorProps {
  segments: Segment[];
  onUpdate: (segments: Segment[]) => void;
  activeSegmentId?: number;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
}

function parseTime(str: string): number {
  const parts = str.split(/[:.]/).map(Number);
  if (parts.length === 3) {
    return parts[0] * 60000 + parts[1] * 1000 + parts[2] * 10;
  }
  return 0;
}

export default function SubtitleEditor({
  segments,
  onUpdate,
  activeSegmentId,
}: SubtitleEditorProps) {
  const updateSegment = (
    index: number,
    field: keyof Segment,
    value: string | number,
  ) => {
    const updated = [...segments];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate(updated);
  };

  const deleteSegment = (index: number) => {
    const updated = segments.filter((_, i) => i !== index);
    onUpdate(updated.map((seg, i) => ({ ...seg, id: i + 1 })));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>แก้ไข Subtitle</CardTitle>
        <CardDescription>{segments.length} segments</CardDescription>
      </CardHeader>
      <CardContent>
        {segments.map((seg, i) => (
          <div
            key={seg.id}
            className={`flex items-start gap-3 px-4 py-3 transition-colors
              ${activeSegmentId === seg.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
          >
            <span className='text-xs text-gray-400 font-mono mt-2 w-6'>
              {seg.id}
            </span>
            <div className='flex-1 space-y-2'>
              <Textarea
                value={seg.text}
                onChange={(e) => updateSegment(i, 'text', e.target.value)}
                rows={4}
                className='w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none'
              />
              <div className='flex gap-2'>
                <div className='flex items-center gap-1'>
                  <span className='text-xs text-muted-foreground'>เริ่ม:</span>
                  <Input
                    type='text'
                    value={formatTime(seg.start)}
                    onChange={(e) =>
                      updateSegment(i, 'start', parseTime(e.target.value))
                    }
                    className='w-24 border border-muted-foreground rounded px-2 py-1 text-xs font-mono focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div className='flex items-center gap-1'>
                  <span className='text-xs text-muted-foreground'>จบ:</span>
                  <Input
                    type='text'
                    value={formatTime(seg.end)}
                    className='w-24 border border-muted-foreground rounded px-2 py-1 text-xs font-mono focus:ring-2 focus:ring-blue-500'
                    onChange={(e) =>
                      updateSegment(i, 'end', parseTime(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>
            <Button
              size='icon-sm'
              variant='destructive'
              onClick={() => deleteSegment(i)}
              title='ลบ'
            >
              ✕
            </Button>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <ExportButtons segments={segments} />
      </CardFooter>
    </Card>
  );
}
