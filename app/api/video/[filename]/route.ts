import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const filePath = path.join(process.cwd(), "uploads", filename);

  try {
    const fileStat = await stat(filePath);
    const fileBuffer = await readFile(filePath);

    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mov": "video/quicktime",
      ".avi": "video/x-msvideo",
      ".mkv": "video/x-matroska",
    };

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeTypes[ext] || "video/mp4",
        "Content-Length": fileStat.size.toString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
