'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { Segment } from '@/lib/subtitle';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ChevronDownIcon, ChevronUpIcon, XIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

type SegmentInsertPosition = 'before' | 'after';

const SEGMENT_DURATION_MS = 2000;

interface SubtitleEditorProps {
  segments: Segment[];
  onUpdate: (segments: Segment[]) => void;
  activeSegmentId?: number;
  handleTimeUpdate?: (timeMs: number) => void;
  onSegmentClick?: (segment: Segment) => void;
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

function renumberSegments(segments: Segment[]) {
  return segments.map((segment, index) => ({ ...segment, id: index + 1 }));
}

function buildInsertedSegment(segments: Segment[], insertAt: number): Segment {
  const previousSegment = segments[insertAt - 1];
  const nextSegment = segments[insertAt];

  if (previousSegment && nextSegment) {
    return {
      id: 0,
      start: previousSegment.end,
      end: nextSegment.start,
      text: '',
    };
  }

  if (previousSegment) {
    return {
      id: 0,
      start: previousSegment.end,
      end: previousSegment.end + SEGMENT_DURATION_MS,
      text: '',
    };
  }

  if (nextSegment) {
    return {
      id: 0,
      start: Math.max(0, nextSegment.start - SEGMENT_DURATION_MS),
      end: nextSegment.start,
      text: '',
    };
  }

  return { id: 0, start: 0, end: SEGMENT_DURATION_MS, text: '' };
}

export default function SubtitleEditor({
  segments,
  onUpdate,
  activeSegmentId,
  handleTimeUpdate,
  onSegmentClick,
}: SubtitleEditorProps) {
  const segmentRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isUserInteracting = useRef(false);

  const setUserInteracting = (value: boolean) => {
    isUserInteracting.current = value;
  };

  const setSegmentRef = useCallback(
    (id: number) => (el: HTMLDivElement | null) => {
      if (el) segmentRefs.current.set(id, el);
      else segmentRefs.current.delete(id);
    },
    []
  );

  useEffect(() => {
    if (!activeSegmentId || isUserInteracting.current) return;

    const activeElement = segmentRefs.current.get(activeSegmentId);
    const container = scrollContainerRef.current;
    if (!activeElement || !container) return;

    const elementTop = activeElement.offsetTop - container.offsetTop;
    const elementBottom = elementTop + activeElement.offsetHeight;
    const viewTop = container.scrollTop;
    const viewBottom = viewTop + container.clientHeight;

    if (elementTop < viewTop || elementBottom > viewBottom) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeSegmentId]);

  const updateSegment = (
    index: number,
    field: keyof Segment,
    value: string | number
  ) => {
    const updated = [...segments];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate(updated);
  };

  const deleteSegment = (index: number) => {
    onUpdate(
      renumberSegments(
        segments.filter((_, segmentIndex) => segmentIndex !== index)
      )
    );
  };

  const stopRowClick = (event: React.SyntheticEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const handleSegmentSelect = (segment: Segment) => {
    onSegmentClick?.(segment);
    const startMs = Number(segment.start);
    if (Number.isFinite(startMs)) {
      handleTimeUpdate?.(startMs);
    }
  };

  const handleSegmentKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    segment: Segment
  ) => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handleSegmentSelect(segment);
  };

  const insertSegment = (index: number, position: SegmentInsertPosition) => {
    const insertAt = position === 'before' ? index : index + 1;
    const newSegment = buildInsertedSegment(segments, insertAt);
    const updated = [
      ...segments.slice(0, insertAt),
      newSegment,
      ...segments.slice(insertAt),
    ];
    onUpdate(renumberSegments(updated));
  };

  return (
    <div className='h-full flex flex-col' role='region' aria-label='Subtitle Editor'>
      {/* Header */}
      <div className='shrink-0 px-4 py-3 border-b border-border flex items-center justify-between'>
        <span className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>
          Subtitles
        </span>
        <span className='text-[11px] text-muted-foreground'>
          {segments.length} segments
        </span>
      </div>

      {/* Segment list */}
      <div
        ref={scrollContainerRef}
        className='flex-1 overflow-y-auto scrollbar-thin'
        onPointerDown={() => setUserInteracting(true)}
        onPointerUp={() => setUserInteracting(false)}
        onPointerCancel={() => setUserInteracting(false)}
        onPointerLeave={() => setUserInteracting(false)}
      >
        <div className='divide-y divide-border'>
          {segments.map((seg, i) => (
            <div
              key={seg.id}
              ref={setSegmentRef(seg.id)}
              className={cn(
                'group flex items-start gap-2 px-3 py-2 transition-colors cursor-pointer',
                activeSegmentId === seg.id
                  ? 'bg-primary/5 border-l-2 border-l-primary'
                  : 'hover:bg-accent/30 border-l-2 border-l-transparent'
              )}
              role='button'
              tabIndex={0}
              aria-pressed={activeSegmentId === seg.id}
              onClick={() => handleSegmentSelect(seg)}
              onKeyDown={(event) => handleSegmentKeyDown(event, seg)}
            >
              <span className='text-[10px] text-muted-foreground/60 font-mono mt-2 w-5 text-right shrink-0'>
                {seg.id}
              </span>

              <div className='flex flex-1 flex-col gap-1.5 min-w-0'>
                <Textarea
                  value={seg.text}
                  onChange={(e) => updateSegment(i, 'text', e.target.value)}
                  onClick={stopRowClick}
                  onPointerDown={stopRowClick}
                  rows={1}
                  className='resize-none text-sm bg-transparent border-transparent focus:border-border focus:bg-card'
                />
                <div className='flex gap-1.5'>
                  <Input
                    type='text'
                    value={formatTime(seg.start)}
                    onChange={(e) =>
                      updateSegment(i, 'start', parseTime(e.target.value))
                    }
                    onClick={stopRowClick}
                    onPointerDown={stopRowClick}
                    className='w-20 text-[11px] font-mono text-muted-foreground bg-transparent border-transparent focus:border-border'
                  />
                  <Input
                    type='text'
                    value={formatTime(seg.end)}
                    onChange={(e) =>
                      updateSegment(i, 'end', parseTime(e.target.value))
                    }
                    onClick={stopRowClick}
                    onPointerDown={stopRowClick}
                    className='w-20 text-[11px] font-mono text-muted-foreground bg-transparent border-transparent focus:border-border'
                  />
                </div>
              </div>

              {/* Action buttons — visible on hover */}
              <div className='flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size='icon-xs'
                      variant='ghost'
                      onClick={(event) => {
                        event.stopPropagation();
                        insertSegment(i, 'before');
                      }}
                    >
                      <ChevronUpIcon className='size-3' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>แทรกก่อน</TooltipContent>
                </Tooltip>
                <Button
                  size='icon-xs'
                  variant='ghost'
                  className='text-destructive hover:text-destructive'
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteSegment(i);
                  }}
                >
                  <XIcon className='size-3' />
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size='icon-xs'
                      variant='ghost'
                      onClick={(event) => {
                        event.stopPropagation();
                        insertSegment(i, 'after');
                      }}
                    >
                      <ChevronDownIcon className='size-3' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>แทรกหลัง</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
