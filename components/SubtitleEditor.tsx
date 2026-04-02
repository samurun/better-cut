"use client";

import { Segment } from "@/lib/subtitle";

interface SubtitleEditorProps {
  segments: Segment[];
  onUpdate: (segments: Segment[]) => void;
  activeSegmentId?: number;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(2, "0")}`;
}

function parseTime(str: string): number {
  const parts = str.split(/[:.]/).map(Number);
  if (parts.length === 3) {
    return parts[0] * 60000 + parts[1] * 1000 + parts[2] * 10;
  }
  return 0;
}

export default function SubtitleEditor({ segments, onUpdate, activeSegmentId }: SubtitleEditorProps) {
  const updateSegment = (index: number, field: keyof Segment, value: string | number) => {
    const updated = [...segments];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate(updated);
  };

  const deleteSegment = (index: number) => {
    const updated = segments.filter((_, i) => i !== index);
    onUpdate(updated.map((seg, i) => ({ ...seg, id: i + 1 })));
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">แก้ไข Subtitle</h3>
        <p className="text-sm text-gray-500">{segments.length} segments</p>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {segments.map((seg, i) => (
          <div
            key={seg.id}
            className={`flex items-start gap-3 px-4 py-3 border-b border-gray-100 transition-colors
              ${activeSegmentId === seg.id ? "bg-blue-50" : "hover:bg-gray-50"}`}
          >
            <span className="text-xs text-gray-400 font-mono mt-2 w-6">{seg.id}</span>
            <div className="flex-1 space-y-2">
              <textarea
                value={seg.text}
                onChange={(e) => updateSegment(i, "text", e.target.value)}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">เริ่ม:</span>
                  <input
                    type="text"
                    value={formatTime(seg.start)}
                    onChange={(e) => updateSegment(i, "start", parseTime(e.target.value))}
                    className="w-24 border border-gray-200 rounded px-2 py-1 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">จบ:</span>
                  <input
                    type="text"
                    value={formatTime(seg.end)}
                    onChange={(e) => updateSegment(i, "end", parseTime(e.target.value))}
                    className="w-24 border border-gray-200 rounded px-2 py-1 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => deleteSegment(i)}
              className="text-red-400 hover:text-red-600 text-sm mt-2 shrink-0"
              title="ลบ"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
