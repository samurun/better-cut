import { NextRequest, NextResponse } from 'next/server';
import { transcribeWithWhisper, type WhisperSegment } from '@/lib/whisper';
import type { Segment } from '@/lib/subtitle';

const MAX_CHARS = 45;
const DEFAULT_LANGUAGE = 'th';

/**
 * แบ่ง Whisper segment ยาวๆ ออกเป็นท่อนสั้นๆ
 * interpolate timestamp ตามสัดส่วนตัวอักษรภายใน segment เดียวกัน
 * (แม่นกว่า interpolate ทั้ง transcript เพราะช่วงเวลาสั้น)
 */
function splitLongSegment(seg: WhisperSegment): Omit<Segment, 'id'>[] {
  const text = seg.text.trim();
  if (text.length <= MAX_CHARS) {
    return [
      {
        start: Math.round(seg.start * 1000),
        end: Math.round(seg.end * 1000),
        text,
      },
    ];
  }

  const duration = seg.end - seg.start;
  const totalChars = text.length;
  const results: Omit<Segment, 'id'>[] = [];
  let pos = 0;

  while (pos < totalChars) {
    let end = Math.min(pos + MAX_CHARS, totalChars);

    // พยายามตัดที่ช่องว่างใกล้ๆ เพื่อไม่ให้คำขาด
    if (end < totalChars) {
      const spaceIdx = text.lastIndexOf(' ', end);
      if (spaceIdx > pos + MAX_CHARS * 0.4) {
        end = spaceIdx;
      }
    }

    const chunk = text.slice(pos, end).trim();
    if (chunk.length > 0) {
      const chunkStart = seg.start + (pos / totalChars) * duration;
      const chunkEnd = seg.start + (end / totalChars) * duration;
      results.push({
        start: Math.round(chunkStart * 1000),
        end: Math.round(chunkEnd * 1000),
        text: chunk,
      });
    }
    pos = end;
  }

  return results;
}

export async function POST(request: NextRequest) {
  const { filePath, languageCode } = await request.json();

  if (!filePath) {
    return NextResponse.json({ error: 'filePath is required' }, { status: 400 });
  }

  try {
    const { text, segments: whisperSegments } = await transcribeWithWhisper(
      filePath,
      languageCode ?? DEFAULT_LANGUAGE,
    );

    console.log(
      `[whisper] segments: ${whisperSegments.length}, text length: ${text.length}`,
      whisperSegments
        .slice(0, 3)
        .map((s) => `"${s.text.slice(0, 30)}..." (${s.start}-${s.end}s)`),
    );

    // Whisper segments → sub-split ถ้ายาวเกิน → renumber
    const segments: Segment[] = whisperSegments
      .flatMap(splitLongSegment)
      .map((seg, i) => ({ ...seg, id: i + 1 }));

    return NextResponse.json({ status: 'completed', segments, text });
  } catch (error) {
    console.error('Whisper transcription error:', error);
    return NextResponse.json({ error: 'Failed to transcribe' }, { status: 500 });
  }
}
