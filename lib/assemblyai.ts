import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

export async function uploadFile(filePath: string): Promise<string> {
  const uploadUrl = await client.files.upload(filePath);
  return uploadUrl;
}

export async function createTranscript(
  audioUrl: string,
  languageCode: string,
): Promise<string> {
  const transcript = await client.transcripts.create({
    audio_url: audioUrl,
    language_code: languageCode,
    speech_models: ['universal-3-pro', 'universal-2'],
  });
  return transcript.id;
}

export async function getTranscript(id: string) {
  const transcript = await client.transcripts.get(id);
  return transcript;
}
