"use client";

import { useState, useCallback, useRef } from "react";
import UploadZone from "@/components/UploadZone";
import LanguageSelect from "@/components/LanguageSelect";
import ProgressBar from "@/components/ProgressBar";
import VideoPlayer from "@/components/VideoPlayer";
import SubtitleEditor from "@/components/SubtitleEditor";
import ExportButtons from "@/components/ExportButtons";
import { Segment } from "@/lib/subtitle";

type AppStatus = "idle" | "uploading" | "queued" | "processing" | "completed" | "error";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [language, setLanguage] = useState("th");
  const [status, setStatus] = useState<AppStatus>("idle");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [error, setError] = useState("");
  const [activeSegmentId, setActiveSegmentId] = useState<number>();
  const pollingRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const handleFileSelected = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setVideoUrl(URL.createObjectURL(selectedFile));
    setSegments([]);
    setStatus("idle");
    setError("");
  }, []);

  const handleTimeUpdate = useCallback(
    (timeMs: number) => {
      const active = segments.find(
        (seg) => timeMs >= seg.start && timeMs <= seg.end
      );
      setActiveSegmentId(active?.id);
    },
    [segments]
  );

  const pollStatus = useCallback((transcriptId: string) => {
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/status/${transcriptId}`);
        const data = await res.json();

        if (data.status === "completed") {
          clearInterval(pollingRef.current);
          setSegments(data.segments);
          setStatus("completed");
        } else if (data.status === "error") {
          clearInterval(pollingRef.current);
          setStatus("error");
          setError(data.error || "Transcription failed");
        } else {
          setStatus(data.status as AppStatus);
        }
      } catch {
        clearInterval(pollingRef.current);
        setStatus("error");
        setError("Failed to check transcription status");
      }
    }, 3000);
  }, []);

  const handleTranscribe = async () => {
    if (!file) return;

    setStatus("uploading");
    setError("");

    try {
      // Upload file
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) throw new Error(uploadData.error);

      // Update video URL to server URL for playback
      setVideoUrl(uploadData.url);

      // Start transcription
      setStatus("processing");
      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: uploadData.filePath,
          languageCode: language,
        }),
      });
      const transcribeData = await transcribeRes.json();

      if (!transcribeRes.ok) throw new Error(transcribeData.error);

      // Poll for results
      pollStatus(transcribeData.transcriptId);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const isProcessing = status === "uploading" || status === "queued" || status === "processing";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Better Cut</h1>
          <p className="text-gray-600 text-lg">สร้าง Subtitle อัตโนมัติจากวิดีโอด้วย AI</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <UploadZone onFileSelected={handleFileSelected} disabled={isProcessing} />

          {file && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span className="text-base">📁</span>
              <span>{file.name}</span>
              <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
            </div>
          )}
        </div>

        {/* Controls */}
        {file && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <LanguageSelect value={language} onChange={setLanguage} disabled={isProcessing} />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleTranscribe}
                  disabled={isProcessing}
                  className="w-full sm:w-auto bg-blue-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? "กำลังทำงาน..." : "เริ่ม Transcribe"}
                </button>
              </div>
            </div>

            {/* Progress */}
            {status !== "idle" && (
              <div className="mt-4">
                <ProgressBar status={status} />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Video Player + Subtitle Editor */}
        {videoUrl && segments.length > 0 && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <VideoPlayer
                videoUrl={videoUrl}
                segments={segments}
                onTimeUpdate={handleTimeUpdate}
              />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <SubtitleEditor
                segments={segments}
                onUpdate={setSegments}
                activeSegmentId={activeSegmentId}
              />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <ExportButtons segments={segments} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
