export interface Segment {
  id: number;
  start: number; // milliseconds
  end: number;
  text: string;
}

function formatTimeSRT(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
}

function formatTimeVTT(ms: number): string {
  return formatTimeSRT(ms).replace(",", ".");
}

export function toSRT(segments: Segment[]): string {
  return segments
    .map(
      (seg, i) =>
        `${i + 1}\n${formatTimeSRT(seg.start)} --> ${formatTimeSRT(seg.end)}\n${seg.text}`
    )
    .join("\n\n");
}

export function toVTT(segments: Segment[]): string {
  const header = "WEBVTT\n\n";
  const body = segments
    .map(
      (seg, i) =>
        `${i + 1}\n${formatTimeVTT(seg.start)} --> ${formatTimeVTT(seg.end)}\n${seg.text}`
    )
    .join("\n\n");
  return header + body;
}
