"use client";

import { useCallback, useState } from "react";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export default function UploadZone({ onFileSelected, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("video/")) {
        onFileSelected(file);
      }
    },
    [onFileSelected, disabled]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
        ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input
        type="file"
        accept="video/*"
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
        id="video-upload"
      />
      <label htmlFor="video-upload" className={`cursor-pointer ${disabled ? "cursor-not-allowed" : ""}`}>
        <div className="text-5xl mb-4">🎬</div>
        <p className="text-lg font-medium text-gray-700">
          ลากวิดีโอมาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
        </p>
        <p className="text-sm text-gray-500 mt-2">
          รองรับ MP4, WebM, MOV, AVI, MKV
        </p>
      </label>
    </div>
  );
}
