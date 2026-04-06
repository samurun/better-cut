import axios from 'axios';

const BASE_URL = 'https://api.assemblyai.com';

function getHeaders() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) throw new Error('ASSEMBLYAI_API_KEY is not set');
  return { authorization: apiKey };
}

export interface AssemblyAISegment {
  start: number; // milliseconds
  end: number; // milliseconds
  text: string;
  speaker?: string;
}

/**
 * Upload a file buffer to AssemblyAI and return the upload URL.
 */
async function uploadFile(file: File): Promise<string> {
  const headers = getHeaders();
  const buffer = Buffer.from(await file.arrayBuffer());
  const response = await axios.post(`${BASE_URL}/v2/upload`, buffer, {
    headers: {
      ...headers,
      'content-type': 'application/octet-stream',
    },
    maxBodyLength: Infinity,
  });
  return response.data.upload_url;
}

/**
 * Transcribe audio using AssemblyAI with polling.
 */
export async function transcribeWithAssemblyAI(
  file: File
): Promise<{ text: string; segments: AssemblyAISegment[] }> {
  const headers = getHeaders();

  const audioUrl = await uploadFile(file);

  const requestData = {
    audio_url: audioUrl,
    speech_models: ['universal'],
    speaker_labels: true,
    format_text: true,
    punctuate: true,
    language_detection: true,
  };

  const response = await axios.post(`${BASE_URL}/v2/transcript`, requestData, {
    headers,
  });

  const transcriptId = response.data.id;
  const pollingEndpoint = `${BASE_URL}/v2/transcript/${transcriptId}`;

  while (true) {
    const pollingResponse = await axios.get(pollingEndpoint, { headers });
    const result = pollingResponse.data;

    if (result.status === 'completed') {
      const source: { start: number; end: number; text: string; speaker?: string }[] =
        result.utterances ?? result.words ?? [];

      const segments: AssemblyAISegment[] = source.map((item) => ({
        start: item.start,
        end: item.end,
        text: item.text,
        speaker: item.speaker ?? undefined,
      }));

      return { text: result.text ?? '', segments };
    } else if (result.status === 'error') {
      throw new Error(`AssemblyAI transcription failed: ${result.error}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}
