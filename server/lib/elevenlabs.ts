import { ReplitConnectors } from "@replit/connectors-sdk";

const connectors = new ReplitConnectors();

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  preview_url: string;
}

export async function getVoices(): Promise<Voice[]> {
  try {
    const response = await connectors.proxy("elevenlabs", "/v1/voices", {
      method: "GET",
    });
    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error("[ElevenLabs] Error fetching voices:", error);
    return [];
  }
}

export async function textToSpeech(
  text: string,
  voiceId: string = "21m00Tcm4TlvDq8ikWAM",
  modelId: string = "eleven_multilingual_v2"
): Promise<Buffer | null> {
  try {
    const response = await connectors.proxy(
      "elevenlabs",
      `/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ElevenLabs] TTS error:", errorText);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("[ElevenLabs] TTS error:", error);
    return null;
  }
}

export async function getModels(): Promise<any[]> {
  try {
    const response = await connectors.proxy("elevenlabs", "/v1/models", {
      method: "GET",
    });
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("[ElevenLabs] Error fetching models:", error);
    return [];
  }
}
