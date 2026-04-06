import { NextRequest, NextResponse } from 'next/server';
import { transcribeWithAssemblyAI } from '@/lib/assemblyai';
import type { Segment } from '@/lib/subtitle';

const MAX_CHARS = 45;

function splitLongSegment(seg: { start: number; end: number; text: string }): Omit<Segment, 'id'>[] {
  const text = seg.text.trim();
  if (text.length <= MAX_CHARS) {
    return [{ start: seg.start, end: seg.end, text }];
  }

  const duration = seg.end - seg.start;
  const totalChars = text.length;
  const results: Omit<Segment, 'id'>[] = [];
  let pos = 0;

  while (pos < totalChars) {
    let end = Math.min(pos + MAX_CHARS, totalChars);

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
        start: Math.round(chunkStart),
        end: Math.round(chunkEnd),
        text: chunk,
      });
    }
    pos = end;
  }

  return results;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 });
  }

  try {
    const { text, segments: rawSegments } = await transcribeWithAssemblyAI(file);

    console.log(
      `[assemblyai] segments: ${rawSegments.length}, text length: ${text.length}`
    );

    const segments: Segment[] = rawSegments
      .flatMap(splitLongSegment)
      .map((seg, i) => ({ ...seg, id: i + 1 }));

    return NextResponse.json({ status: 'completed', segments, text });
  } catch (error) {
    console.error('AssemblyAI transcription error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to transcribe';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
