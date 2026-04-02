'use client';

import { useState, useCallback } from 'react';
import { Segment } from '@/lib/subtitle';
import { AppStatus } from '@/lib/types';

export function useTranscribe() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [language, setLanguage] = useState('th');
  const [status, setStatus] = useState<AppStatus>('idle');
  const [segments, setSegments] = useState<Segment[]>([]);
  const [error, setError] = useState('');

  const isProcessing =
    status === 'uploading' || status === 'queued' || status === 'processing';

  const handleFileSelected = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setVideoUrl(URL.createObjectURL(selectedFile));
    setSegments([]);
    setStatus('idle');
    setError('');
  }, []);

  const handleTranscribe = async () => {
    if (!file) return;

    setStatus('uploading');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) throw new Error(uploadData.error);

      setVideoUrl(uploadData.url);
      setStatus('processing');

      const transcribeRes = await fetch('/api/transcribe-whisper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: uploadData.filePath,
          languageCode: language,
        }),
      });
      const data = await transcribeRes.json();

      if (!transcribeRes.ok) throw new Error(data.error);

      setSegments(data.segments);
      setStatus('completed');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return {
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
  };
}
