import fs from 'fs';
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

export async function transcribeWithWhisper(
  filePath: string,
  language: string,
): Promise<{ text: string; segments: WhisperSegment[] }> {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
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
    }),
  );

  return { text: transcription.text, segments };
}
