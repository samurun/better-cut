import { NextRequest, NextResponse } from "next/server";
import { getTranscript } from "@/lib/assemblyai";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const transcript = await getTranscript(id);

    if (transcript.status === "completed") {
      const segments =
        transcript.utterances?.map((u, i) => ({
          id: i + 1,
          start: u.start,
          end: u.end,
          text: u.text,
        })) ??
        transcript.words?.reduce(
          (acc: { id: number; start: number; end: number; text: string }[], word, i) => {
            if (i === 0 || word.start - acc[acc.length - 1].end > 1000) {
              acc.push({
                id: acc.length + 1,
                start: word.start,
                end: word.end,
                text: word.text,
              });
            } else {
              acc[acc.length - 1].end = word.end;
              acc[acc.length - 1].text += " " + word.text;
            }
            return acc;
          },
          []
        ) ??
        [];

      return NextResponse.json({
        status: "completed",
        segments,
        text: transcript.text,
      });
    }

    if (transcript.status === "error") {
      return NextResponse.json(
        { status: "error", error: transcript.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: transcript.status });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
