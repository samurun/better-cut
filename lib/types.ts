export type AppStatus =
  | 'idle'
  | 'processing'
  | 'completed'
  | 'error';

export type TranscribeProvider = 'whisper' | 'assemblyai';
