import { NextRequest, NextResponse } from "next/server";
import { uploadFile, createTranscript } from "@/lib/assemblyai";

export async function POST(request: NextRequest) {
  const { filePath, languageCode } = await request.json();

  if (!filePath) {
    return NextResponse.json(
      { error: "filePath is required" },
      { status: 400 }
    );
  }

  try {
    const audioUrl = await uploadFile(filePath);
    const transcriptId = await createTranscript(
      audioUrl,
      languageCode || "en"
    );
    return NextResponse.json({ transcriptId });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to start transcription" },
      { status: 500 }
    );
  }
}
