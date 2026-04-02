'use client';

import UploadZone from '@/components/upload-zone';
import LanguageSelect from '@/components/language-select';
import ProgressBar from '@/components/progress-bar';
import VideoPlayer from '@/components/video-player';
import SubtitleEditor from '@/components/subtitle-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranscribe } from '@/hooks/use-transcribe';
import { useActiveSegment } from '@/hooks/use-active-segment';

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

  const { activeSegmentId, handleTimeUpdate } = useActiveSegment(segments);

  return (
    <main className='min-h-screen bg-background'>
      <div className='max-w-4xl mx-auto px-4 py-10 space-y-4'>
        {/* Header */}
        <div className='text-center mb-10'>
          <h1 className='text-4xl font-bold text-foreground mb-2'>
            Better Cut
          </h1>
          <p className='text-muted-foreground text-lg'>
            สร้าง Subtitle อัตโนมัติจากวิดีโอด้วย AI
          </p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardContent>
            <UploadZone
              onFileSelected={handleFileSelected}
              disabled={isProcessing}
            />
            {file && (
              <div className='mt-4 flex items-center gap-2 text-sm text-muted-foreground'>
                <span className='text-base'>📁</span>
                <span className='truncate'>{file.name}</span>
                <span className='text-muted-foreground/60 text-nowrap'>
                  ({(file.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controls */}
        {file && (
          <Card>
            <CardHeader>
              <CardTitle>ภาษาในวิดีโอ</CardTitle>
            </CardHeader>
            <CardContent className='gap-4 flex flex-col'>
              <div className='flex items-end gap-2'>
                <LanguageSelect
                  value={language}
                  onChange={setLanguage}
                  disabled={isProcessing}
                />
                <Button onClick={handleTranscribe} disabled={isProcessing}>
                  {isProcessing ? 'กำลังทำงาน...' : 'เริ่ม Transcribe'}
                </Button>
              </div>

              {status !== 'idle' && <ProgressBar status={status} />}

              {error && (
                <div className='bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm'>
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Video Player + Subtitle Editor */}
        {videoUrl && segments.length > 0 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Video Player</CardTitle>
              </CardHeader>
              <CardContent>
                <VideoPlayer
                  videoUrl={videoUrl}
                  segments={segments}
                  onTimeUpdate={handleTimeUpdate}
                />
              </CardContent>
            </Card>

            <SubtitleEditor
              segments={segments}
              onUpdate={setSegments}
              activeSegmentId={activeSegmentId}
            />
          </>
        )}
      </div>
    </main>
  );
}
