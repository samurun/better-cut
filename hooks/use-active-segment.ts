'use client';

import { useState, useCallback } from 'react';
import { Segment } from '@/lib/subtitle';

export function useActiveSegment(segments: Segment[]) {
  const [activeSegmentId, setActiveSegmentId] = useState<number>();

  const handleTimeUpdate = useCallback(
    (timeMs: number) => {
      const active = segments.find(
        (seg) => timeMs >= seg.start && timeMs <= seg.end,
      );
      setActiveSegmentId(active?.id);
    },
    [segments],
  );

  return { activeSegmentId, handleTimeUpdate };
}
