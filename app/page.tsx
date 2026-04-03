'use client';

import { useRef } from 'react';
import UploadZone from '@/components/upload-zone';
import LanguageSelect from '@/components/language-select';
import ProgressBar from '@/components/progress-bar';
import VideoPlayer, { type VideoPlayerHandle } from '@/components/video-player';
import SubtitleEditor from '@/components/subtitle-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useTranscribe } from '@/hooks/use-transcribe';
import { useActiveSegment } from '@/hooks/use-active-segment';
import type { Segment } from '@/lib/subtitle';
import { CircleAlertIcon, FileIcon } from 'lucide-react';

export default function Home() {
  const {
    file,
    videoUrl,
    language,
    setLanguage,
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

  return (
    <main className='min-h-screen bg-background'>
      <div className='container mx-auto flex flex-col gap-4 px-4 py-10'>
        <div className='text-center mb-10'>
          <h1 className='text-4xl font-bold text-foreground mb-2'>
            Better Cut
          </h1>
          <p className='text-muted-foreground text-lg'>
            สร้าง Subtitle อัตโนมัติจากวิดีโอด้วย AI
          </p>
        </div>

        <Card>
          <CardContent>
            <UploadZone
              onFileSelected={handleFileSelected}
              disabled={isProcessing}
            />
            {file && (
              <div className='mt-4 flex items-center gap-2 text-sm text-muted-foreground'>
                <FileIcon />
                <span className='truncate'>{file.name}</span>
                <span className='text-muted-foreground/60 text-nowrap'>
                  ({(file.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {file && (
          <Card>
            <CardHeader>
              <CardTitle>ภาษาในวิดีโอ</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
              <div className='flex items-end gap-2'>
                <LanguageSelect
                  value={language}
                  onChange={setLanguage}
                  disabled={isProcessing}
                />
                <Button onClick={handleTranscribe} disabled={isProcessing}>
                  {isProcessing && <Spinner data-icon='inline-start' />}
                  {isProcessing ? 'กำลังทำงาน...' : 'เริ่ม Transcribe'}
                </Button>
              </div>

              {status !== 'idle' && <ProgressBar status={status} />}

              {error && (
                <Alert variant='destructive'>
                  <CircleAlertIcon />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {videoUrl && segments.length > 0 && (
          <div className='grid gap-4 lg:items-start xl:grid-cols-3'>
            <div className='w-full shrink-0 xl:col-span-2 xl:sticky xl:top-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Video Player</CardTitle>
                </CardHeader>
                <CardContent>
                  <VideoPlayer
                    key={videoUrl}
                    ref={videoPlayerRef}
                    videoUrl={videoUrl}
                    segments={segments}
                    onTimeUpdate={handleTimeUpdate}
                  />
                </CardContent>
              </Card>
            </div>

            <div>
              <SubtitleEditor
                segments={segments}
                onUpdate={setSegments}
                activeSegmentId={activeSegmentId}
                handleTimeUpdate={handleTimeUpdate}
                onSegmentClick={handleSegmentClick}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
