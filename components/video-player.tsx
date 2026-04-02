'use client';

import { useRef, useEffect, useState } from 'react';
import { Segment } from '@/lib/subtitle';

interface VideoPlayerProps {
  videoUrl: string;
  segments: Segment[];
  onTimeUpdate?: (timeMs: number) => void;
}

export default function VideoPlayer({
  videoUrl,
  segments,
  onTimeUpdate,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [subtitleKey, setSubtitleKey] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let lastSegId = -1;
    let rafId: number;

    const tick = () => {
      if (!video.paused && !video.ended) {
        const timeMs = video.currentTime * 1000;
        onTimeUpdate?.(timeMs);

        const active = segments.find(
          (seg) => timeMs >= seg.start && timeMs <= seg.end,
        );

        if (active) {
          if (active.id !== lastSegId) {
            lastSegId = active.id;
            setSubtitleKey((k) => k + 1);
          }
          setCurrentSubtitle(active.text);
        } else {
          lastSegId = -1;
          setCurrentSubtitle('');
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [segments, onTimeUpdate]);

  return (
    <div className='relative w-full bg-black rounded-lg overflow-hidden'>
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className='w-full max-h-125'
      />
      {currentSubtitle && (
        <div className='absolute inset-0 flex bottom-12 items-end justify-center pointer-events-none px-6'>
          <span
            key={subtitleKey}
            className='text-white text-2xl  sm:text-3xl md:text-4xl font-extrabold text-center leading-tight animate-[subtitle-pop_0.2s_ease-out]'
            style={{
              textShadow: '0 0 8px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.7)',
              maxWidth: '85%',
            }}
          >
            {currentSubtitle}
          </span>
        </div>
      )}
    </div>
  );
}
