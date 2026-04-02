"use client";

import { useRef, useEffect, useState } from "react";
import { Segment } from "@/lib/subtitle";

interface VideoPlayerProps {
  videoUrl: string;
  segments: Segment[];
  onTimeUpdate?: (timeMs: number) => void;
}

export default function VideoPlayer({ videoUrl, segments, onTimeUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState("");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const timeMs = video.currentTime * 1000;
      onTimeUpdate?.(timeMs);

      const active = segments.find(
        (seg) => timeMs >= seg.start && timeMs <= seg.end
      );
      setCurrentSubtitle(active?.text || "");
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [segments, onTimeUpdate]);

  return (
    <div className="relative w-full bg-black rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className="w-full max-h-[500px]"
      />
      {currentSubtitle && (
        <div className="absolute bottom-16 left-0 right-0 text-center px-4">
          <span className="bg-black/75 text-white px-4 py-2 rounded-lg text-lg inline-block max-w-[80%]">
            {currentSubtitle}
          </span>
        </div>
      )}
    </div>
  );
}
