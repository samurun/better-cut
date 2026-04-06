'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Segment } from '@/lib/subtitle';
import type { AppStatus, TranscribeProvider } from '@/lib/types';

export function useTranscribe() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [language, setLanguage] = useState('th');
  const [provider, setProvider] = useState<TranscribeProvider>('whisper');
  const [status, setStatus] = useState<AppStatus>('idle');
  const [segments, setSegments] = useState<Segment[]>([]);
  const [error, setError] = useState('');
  const objectUrlRef = useRef<string | null>(null);

  const isProcessing = status === 'processing';

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

    setStatus('processing');
    setError('');

    try {
      const endpoint =
        provider === 'assemblyai'
          ? '/api/transcribe-assemblyai'
          : '/api/transcribe-whisper';

      const formData = new FormData();
      formData.append('file', file);
      if (provider === 'whisper') {
        formData.append('languageCode', language);
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setSegments(data.segments);
      setStatus('completed');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }, [file, language, provider]);

  return {
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
  };
}
