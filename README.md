# Better Cut

AI-powered subtitle generator for videos. Upload a video, auto-transcribe with Whisper, edit subtitles in real-time, and export.

## Features

- Upload video (MP4, WebM, etc.)
- Auto-transcribe with Groq Whisper Large v3
- Synchronized subtitle preview on video player
- Inline subtitle editor with timestamp controls
- Export to SRT / VTT
- Multi-language support (default: Thai)

## Tech Stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui
- **AI:** Groq Whisper API (via OpenAI SDK)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create `.env.local` in the project root:

```env
GROQ_API_KEY=your_groq_api_key
```

Get a free API key at [console.groq.com](https://console.groq.com).

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  page.tsx                        # Main page (UI only)
  api/
    upload/                       # Video file upload
    transcribe-whisper/           # Whisper transcription + segmentation
    video/[filename]/             # Serve uploaded videos
components/
  video-player.tsx                # Video player with subtitle overlay
  subtitle-editor.tsx             # Edit subtitle text + timestamps
  upload-zone.tsx                 # Drag & drop file upload
  language-select.tsx             # Language picker
  progress-bar.tsx                # Transcription progress
  export-buttons.tsx              # SRT/VTT export
hooks/
  use-transcribe.ts               # Transcription state & logic
  use-active-segment.ts           # Track active subtitle segment
lib/
  whisper.ts                      # Groq Whisper API client
  subtitle.ts                     # Segment type + SRT/VTT formatters
  types.ts                        # Shared types
```

## How It Works

1. Upload video -> saved to `/uploads`
2. Video sent to Groq Whisper API -> returns timestamped segments
3. Long segments auto-split (max 45 chars) with interpolated timestamps
4. Video player syncs subtitles in real-time via `requestAnimationFrame`
5. Edit subtitles inline, then export as SRT or VTT
