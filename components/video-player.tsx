'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { Segment } from '@/lib/subtitle';

interface SeekOptions {
  play?: boolean;
}

export interface VideoPlayerHandle {
  seekTo: (timeMs: number, options?: SeekOptions) => void;
}

interface VideoPlayerProps {
  videoUrl: string;
  segments: Segment[];
  onTimeUpdate?: (timeMs: number) => void;
}

function findActive(segments: Segment[], timeMs: number) {
  return segments.find((seg) => timeMs >= seg.start && timeMs < seg.end);
}

function syncSubtitle(
  segments: Segment[],
  timeMs: number,
  onSubtitleChange: (subtitle: string, segmentId?: number) => void
) {
  const activeSegment = findActive(segments, timeMs);
  onSubtitleChange(activeSegment?.text ?? '', activeSegment?.id);
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer({ videoUrl, segments, onTimeUpdate }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentSubtitle, setCurrentSubtitle] = useState('');
    const [subtitleKey, setSubtitleKey] = useState(0);

    const segmentsRef = useRef(segments);
    const onTimeUpdateRef = useRef(onTimeUpdate);

    useEffect(() => {
      segmentsRef.current = segments;
      onTimeUpdateRef.current = onTimeUpdate;
    }, [segments, onTimeUpdate]);

    const updateSubtitle = (subtitle: string, segmentId?: number) => {
      setCurrentSubtitle((currentValue) => {
        if (segmentId === undefined) {
          return currentValue ? '' : currentValue;
        }
        setSubtitleKey((currentKey) =>
          currentKey + (currentValue === subtitle ? 0 : 1)
        );
        return subtitle;
      });
    };

    useImperativeHandle(
      ref,
      () => ({
        seekTo(timeMs: number, options?: SeekOptions) {
          const video = videoRef.current;
          if (!video || !Number.isFinite(timeMs)) return;

          const safeTimeMs = Math.max(0, timeMs);
          const shouldPlay = options?.play ?? false;

          const seek = () => {
            video.currentTime = safeTimeMs / 1000;
            syncSubtitle(segmentsRef.current, safeTimeMs, updateSubtitle);
            onTimeUpdateRef.current?.(safeTimeMs);
            if (shouldPlay) void video.play().catch(() => {});
          };

          if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
            video.addEventListener('loadedmetadata', seek, { once: true });
            return;
          }

          seek();
        },
      }),
      []
    );

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;
      const timeMs = video.currentTime * 1000;
      syncSubtitle(segments, timeMs, updateSubtitle);
    }, [segments]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      let lastSegId = -1;
      let rafId: number;

      const tick = () => {
        if (!video.paused && !video.ended) {
          const timeMs = video.currentTime * 1000;
          onTimeUpdateRef.current?.(timeMs);

          const active = findActive(segmentsRef.current, timeMs);

          if (active) {
            if (active.id !== lastSegId) {
              lastSegId = active.id;
              setSubtitleKey((k) => k + 1);
            }
            setCurrentSubtitle(active.text);
          } else if (lastSegId !== -1) {
            lastSegId = -1;
            setCurrentSubtitle('');
          }
        }
        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafId);
    }, []);

    return (
      <div className='relative w-full overflow-hidden rounded-lg bg-black'>
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className='w-full max-h-[70vh]'
        />
        {currentSubtitle && (
          <div className='pointer-events-none absolute inset-0 bottom-12 flex items-end justify-center px-6'>
            <span
              key={subtitleKey}
              className='rounded bg-black/60 px-3 py-1.5 text-center text-lg font-semibold leading-tight text-white'
              style={{
                textShadow:
                  '0 0 8px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.7)',
                maxWidth: '85%',
                animation: 'subtitle-pop 0.2s ease-out',
              }}
            >
              {currentSubtitle}
            </span>
          </div>
        )}
      </div>
    );
  }
);

export default VideoPlayer;
