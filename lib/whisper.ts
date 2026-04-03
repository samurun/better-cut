import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
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

const MAX_BYTES = 24 * 1024 * 1024; // 24 MB — stay under Groq's 25 MB limit
const CHUNK_SECONDS = 600; // 10-minute chunks

function getAudioDuration(filePath: string): number {
  const out = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
  )
    .toString()
    .trim();
  return parseFloat(out);
}

function splitAudio(filePath: string, tmpDir: string): string[] {
  const duration = getAudioDuration(filePath);
  const chunkPaths: string[] = [];
  let start = 0;
  let index = 0;

  while (start < duration) {
    const chunkPath = path.join(tmpDir, `chunk_${index}.mp3`);
    execSync(
      `ffmpeg -y -i "${filePath}" -ss ${start} -t ${CHUNK_SECONDS} -vn -ar 16000 -ac 1 -q:a 5 "${chunkPath}"`
    );
    chunkPaths.push(chunkPath);
    start += CHUNK_SECONDS;
    index++;
  }

  return chunkPaths;
}

async function transcribeChunk(
  filePath: string,
  language: string,
  offsetSeconds: number
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
      start: s.start + offsetSeconds,
      end: s.end + offsetSeconds,
    })
  );

  return { text: transcription.text, segments };
}

export async function transcribeWithWhisper(
  filePath: string,
  language: string
): Promise<{ text: string; segments: WhisperSegment[] }> {
  const fileSize = fs.statSync(filePath).size;

  if (fileSize <= MAX_BYTES) {
    return transcribeChunk(filePath, language, 0);
  }

  // File too large — split into chunks
  console.log(
    `[whisper] File too large (${(fileSize / 1024 / 1024).toFixed(1)} MB), splitting into chunks…`
  );

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'whisper-'));
  try {
    const chunkPaths = splitAudio(filePath, tmpDir);
    console.log(`[whisper] Split into ${chunkPaths.length} chunks`);

    const allTexts: string[] = [];
    const allSegments: WhisperSegment[] = [];
    let offsetSeconds = 0;

    for (let i = 0; i < chunkPaths.length; i++) {
      console.log(`[whisper] Transcribing chunk ${i + 1}/${chunkPaths.length}`);
      const { text, segments } = await transcribeChunk(
        chunkPaths[i],
        language,
        offsetSeconds
      );
      allTexts.push(text);
      allSegments.push(...segments);
      offsetSeconds += CHUNK_SECONDS;
    }

    return { text: allTexts.join(' '), segments: allSegments };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}
