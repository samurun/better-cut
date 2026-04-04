import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: 'https://api.groq.com/openai/v1',
});

export type WhisperSegment = {
  text: string;
  start: number;
  end: number;
};

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB — Groq's limit

export async function transcribeWithWhisper(
  file: File,
  language: string
): Promise<{ text: string; segments: WhisperSegment[] }> {
  if (file.size > MAX_BYTES) {
    throw new Error(
      `ไฟล์มีขนาด ${(file.size / 1024 / 1024).toFixed(1)} MB ซึ่งเกินขีดจำกัด 25 MB ของ Groq Whisper`
    );
  }

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-large-v3',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
    language,
  });

  const segments: WhisperSegment[] = (transcription.segments ?? []).map(
    (s) => ({
      text: s.text.trim(),
      start: s.start,
      end: s.end,
    })
  );

  return { text: transcription.text, segments };
}
