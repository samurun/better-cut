'use client';

import { useCallback, useRef } from 'react';
import UploadZone from '@/components/upload-zone';
import LanguageSelect from '@/components/language-select';
import ProviderSelect from '@/components/provider-select';
import ProgressBar from '@/components/progress-bar';
import VideoPlayer, { type VideoPlayerHandle } from '@/components/video-player';
import SubtitleEditor from '@/components/subtitle-editor';
import ExportButtons from '@/components/export-buttons';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useTranscribe } from '@/hooks/use-transcribe';
import { useActiveSegment } from '@/hooks/use-active-segment';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import type { Segment } from '@/lib/subtitle';
import { CircleAlertIcon, FileIcon, ScissorsIcon } from 'lucide-react';

export default function Home() {
  const {
    file,
    videoUrl,
    language,
    setLanguage,
    provider,
    setProvider,
    status,
    segments,
    setSegments,
    error,
    isProcessing,
    handleFileSelected,
    handleTranscribe,
  } = useTranscribe();

  const videoPlayerRef = useRef<VideoPlayerHandle>(null);
  const { activeSegmentId, setActiveSegmentId, handleTimeUpdate } =
    useActiveSegment(segments);

  const handleSegmentClick = (segment: Segment) => {
    setActiveSegmentId(segment.id);
    const startMs = Number(segment.start);
    if (!Number.isFinite(startMs)) return;
    videoPlayerRef.current?.seekTo(startMs);
  };

  const hasSegments = videoUrl && segments.length > 0;

  const handlePlayPause = useCallback(() => {
    const video = document.querySelector('video');
    if (!video) return;
    if (video.paused) void video.play().catch(() => {});
    else video.pause();
  }, []);

  const handleNavigateSegment = useCallback(
    (direction: 1 | -1) => {
      if (!segments.length) return;
      const currentIdx = segments.findIndex((s) => s.id === activeSegmentId);
      const nextIdx = Math.max(
        0,
        Math.min(segments.length - 1, currentIdx + direction),
      );
      const next = segments[nextIdx];
      handleSegmentClick(next);
    },
    [segments, activeSegmentId, handleSegmentClick],
  );

  useKeyboardShortcuts({
    onPlayPause: handlePlayPause,
    onNextSegment: () => handleNavigateSegment(1),
    onPrevSegment: () => handleNavigateSegment(-1),
    onEscape: () => setActiveSegmentId(undefined),
  });

  // Initial state — centered upload
  if (!file) {
    return (
      <main className='h-full flex flex-col'>
        <Header />
        <div className='flex-1 flex items-center justify-center px-4'>
          <div className='w-full max-w-md'>
            <UploadZone onFileSelected={handleFileSelected} />
          </div>
        </div>
      </main>
    );
  }

  // Working state — three-panel layout (desktop) / stacked (mobile)
  return (
    <main className='h-full flex flex-col'>
      <Header fileName={file.name} fileSize={file.size} />

      {/* Mobile / Tablet: stacked scrollable layout */}
      {/* Desktop (xl): fixed 3-panel grid */}
      <div className='flex-1 flex flex-col lg:grid lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_360px] lg:overflow-hidden overflow-y-auto'>
        {/* Controls bar (mobile: compact row) / Sidebar (desktop: column) */}
        <aside className='shrink-0 border-b lg:border-b-0 lg:border-r border-border p-3 lg:p-4 lg:overflow-y-auto scrollbar-thin'>
          {/* Mobile: horizontal compact layout */}
          <div className='flex flex-wrap items-end gap-3 lg:hidden'>
            <div className='flex-1 min-w-35'>
              <MobileLabel>Provider</MobileLabel>
              <ProviderSelect
                value={provider}
                onChange={setProvider}
                disabled={isProcessing}
              />
            </div>
            <div className='flex-1 min-w-30'>
              <MobileLabel>ภาษา</MobileLabel>
              <LanguageSelect
                value={language}
                onChange={setLanguage}
                disabled={isProcessing}
              />
            </div>
            <Button
              onClick={handleTranscribe}
              disabled={isProcessing}
              className='shrink-0'
            >
              {isProcessing && <Spinner data-icon='inline-start' />}
              {isProcessing ? 'กำลังทำงาน...' : 'Transcribe'}
            </Button>
            {hasSegments && (
              <div className='flex gap-2'>
                <ExportButtons segments={segments} />
              </div>
            )}
          </div>

          {/* Mobile: progress/error below controls */}
          <div className='lg:hidden'>
            {status !== 'idle' && (
              <div className='mt-3'>
                <ProgressBar status={status} />
              </div>
            )}
            {error && (
              <div className='flex items-start gap-2 text-sm text-destructive mt-2'>
                <CircleAlertIcon className='size-4 mt-0.5 shrink-0' />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Desktop: vertical sidebar layout */}
          <div className='hidden lg:flex lg:flex-col lg:gap-5'>
            <div className='flex flex-col gap-2'>
              <SidebarLabel>Provider</SidebarLabel>
              <ProviderSelect
                value={provider}
                onChange={setProvider}
                disabled={isProcessing}
              />
            </div>

            <div className='flex flex-col gap-2'>
              <SidebarLabel>ภาษา</SidebarLabel>
              <LanguageSelect
                value={language}
                onChange={setLanguage}
                disabled={isProcessing}
              />
            </div>
            <Button
              onClick={handleTranscribe}
              disabled={isProcessing}
              className='w-full'
            >
              {isProcessing && <Spinner data-icon='inline-start' />}
              {isProcessing ? 'กำลังทำงาน...' : 'เริ่ม Transcribe'}
            </Button>

            {status !== 'idle' && <ProgressBar status={status} />}

            {error && (
              <div className='flex items-start gap-2 text-sm text-destructive'>
                <CircleAlertIcon className='size-4 mt-0.5 shrink-0' />
                <span>{error}</span>
              </div>
            )}

            {hasSegments && (
              <div className='flex flex-col gap-2 mt-auto'>
                <SidebarLabel>Export</SidebarLabel>
                <ExportButtons segments={segments} />
              </div>
            )}
          </div>
        </aside>

        {/* Center — video */}
        <div className='shrink-0 lg:overflow-y-auto scrollbar-thin'>
          <div className='p-3 lg:p-4'>
            {!hasSegments && (
              <div className='mb-4'>
                <UploadZone
                  onFileSelected={handleFileSelected}
                  disabled={isProcessing}
                />
              </div>
            )}
            {videoUrl && (
              <VideoPlayer
                key={videoUrl}
                ref={videoPlayerRef}
                videoUrl={videoUrl}
                segments={segments}
                onTimeUpdate={handleTimeUpdate}
              />
            )}
          </div>
        </div>

        {/* Right panel — subtitle editor */}
        {hasSegments && (
          <div className='border-t lg:border-t-0 xl:border-l border-border min-h-[50vh] lg:min-h-0 lg:overflow-hidden'>
            <SubtitleEditor
              segments={segments}
              onUpdate={setSegments}
              activeSegmentId={activeSegmentId}
              handleTimeUpdate={handleTimeUpdate}
              onSegmentClick={handleSegmentClick}
            />
          </div>
        )}
      </div>
    </main>
  );
}

function Header({
  fileName,
  fileSize,
}: {
  fileName?: string;
  fileSize?: number;
}) {
  return (
    <header className='h-10 shrink-0 border-b border-border flex items-center px-3 lg:px-4 gap-3'>
      <div className='flex items-center gap-2'>
        <ScissorsIcon className='size-4 text-primary' />
        <span className='text-sm font-semibold tracking-tight'>Better Cut</span>
      </div>
      {fileName && (
        <div className='flex items-center gap-2 text-xs text-muted-foreground ml-2 lg:ml-4 min-w-0'>
          <FileIcon className='size-3 shrink-0' />
          <span className='truncate'>{fileName}</span>
          {fileSize != null && (
            <span className='text-muted-foreground/60 shrink-0 hidden sm:inline'>
              ({(fileSize / 1024 / 1024).toFixed(1)} MB)
            </span>
          )}
        </div>
      )}
    </header>
  );
}

function SidebarLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>
      {children}
    </span>
  );
}

function MobileLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1 block'>
      {children}
    </span>
  );
}
