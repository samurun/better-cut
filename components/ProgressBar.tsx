"use client";

interface ProgressBarProps {
  status: string;
}

export default function ProgressBar({ status }: ProgressBarProps) {
  const statusMap: Record<string, { label: string; color: string; progress: number }> = {
    uploading: { label: "กำลังอัปโหลด...", color: "bg-blue-500", progress: 25 },
    queued: { label: "อยู่ในคิว...", color: "bg-yellow-500", progress: 40 },
    processing: { label: "กำลัง Transcribe...", color: "bg-blue-500", progress: 70 },
    completed: { label: "เสร็จสิ้น!", color: "bg-green-500", progress: 100 },
    error: { label: "เกิดข้อผิดพลาด", color: "bg-red-500", progress: 100 },
  };

  const current = statusMap[status] || { label: status, color: "bg-gray-500", progress: 50 };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{current.label}</span>
        <span className="text-sm text-gray-500">{current.progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${current.color}`}
          style={{ width: `${current.progress}%` }}
        />
      </div>
    </div>
  );
}
