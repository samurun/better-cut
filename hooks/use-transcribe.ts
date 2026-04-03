'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Segment } from '@/lib/subtitle';
import type { AppStatus } from '@/lib/types';

export function useTranscribe() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [language, setLanguage] = useState('th');
  const [status, setStatus] = useState<AppStatus>('idle');
  const [segments, setSegments] = useState<Segment[]>([]);
  const [error, setError] = useState('');
  const objectUrlRef = useRef<string | null>(null);

  const isProcessing =
    status === 'uploading' || status === 'queued' || status === 'processing';

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleFileSelected = useCallback((selectedFile: File) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const localUrl = URL.createObjectURL(selectedFile);
    objectUrlRef.current = localUrl;

    setFile(selectedFile);
    setVideoUrl(localUrl);
    setSegments([]);
    setStatus('idle');
    setError('');
  }, []);

  const handleTranscribe = useCallback(async () => {
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
  }, [file, language]);

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
