"use client";

import { Segment, toSRT, toVTT } from "@/lib/subtitle";

interface ExportButtonsProps {
  segments: Segment[];
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportButtons({ segments }: ExportButtonsProps) {
  return (
    <div className="flex gap-3">
      <button
        onClick={() => downloadFile(toSRT(segments), "subtitle.srt", "text/plain")}
        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        ดาวน์โหลด SRT
      </button>
      <button
        onClick={() => downloadFile(toVTT(segments), "subtitle.vtt", "text/vtt")}
        className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
      >
        ดาวน์โหลด VTT
      </button>
    </div>
  );
}
