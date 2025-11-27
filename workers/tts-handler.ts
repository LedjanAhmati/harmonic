/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Text-to-Speech Handler
 * Abstracts multiple TTS providers (ElevenLabs, Google, local)
 */

export interface TTSConfig {
  provider: "elevenlabs" | "google" | "local";
  apiKey?: string;
  voice?: string;
  language?: string;
  speed?: number; // 0.5 - 2.0
}

export interface TTSResult {
  audioBuffer: ArrayBuffer;
  mimeType: string;
  sampleRate: number;
}

/**
 * Base TTS class
 */
export abstract class TTSHandler {
  protected config: TTSConfig;

  constructor(config: TTSConfig) {
    this.config = config;
  }

  abstract synthesize(text: string): Promise<TTSResult>;
}

/**
 * ElevenLabs TTS Implementation
 * High-quality voices, natural sounding
 */
export class ElevenLabsTTS extends TTSHandler {
  private apiKey: string;
  private voiceId: string;
  private apiUrl = "https://api.elevenlabs.io/v1";

  constructor(apiKey: string, voiceId: string = "21m00Tcm4TlvDq8ikWAM") {
    // 21m00Tcm4TlvDq8ikWAM is Rachel voice
    super({ provider: "elevenlabs", apiKey });
    this.apiKey = apiKey;
    this.voiceId = voiceId;
  }

  async synthesize(text: string): Promise<TTSResult> {
    try {
      const response = await fetch(
        `${this.apiUrl}/text-to-speech/${this.voiceId}?optimize_streaming_latency=3`,
        {
          method: "POST",
          headers: {
            "xi-api-key": this.apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs error: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();

      return {
        audioBuffer,
        mimeType: "audio/mpeg",
        sampleRate: 22050, // ElevenLabs default
      };
    } catch (error) {
      console.error("ElevenLabs TTS error:", error);
      throw error;
    }
  }
}

/**
 * Google Cloud TTS Implementation
 * Affordable, good quality
 */
export class GoogleTTS extends TTSHandler {
  private apiKey: string;
  private apiUrl = "https://texttospeech.googleapis.com/v1/text:synthesize";

  constructor(apiKey: string) {
    super({ provider: "google", apiKey });
    this.apiKey = apiKey;
  }

  async synthesize(text: string): Promise<TTSResult> {
    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            text,
          },
          voice: {
            languageCode: this.config.language || "en-US",
            name: this.config.voice || "en-US-Neural2-C",
          },
          audioConfig: {
            audioEncoding: "MP3",
            pitch: 0,
            speakingRate: this.config.speed || 1.0,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Google TTS error: ${response.status}`);
      }

      const result = await response.json();
      const audioBuffer = Buffer.from(result.audioContent, "base64");

      return {
        audioBuffer: audioBuffer.buffer,
        mimeType: "audio/mp3",
        sampleRate: 24000,
      };
    } catch (error) {
      console.error("Google TTS error:", error);
      throw error;
    }
  }
}

/**
 * Local TTS stub (for development)
 * Uses browser Web Speech API or local synthesis
 */
export class LocalTTS extends TTSHandler {
  constructor() {
    super({ provider: "local" });
  }

  async synthesize(text: string): Promise<TTSResult> {
    // Stub: would use browser SpeechSynthesis API
    // For now, return empty audio buffer
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const emptyBuffer = audioContext.createBuffer(1, 44100, 44100);

    return {
      audioBuffer: emptyBuffer.getChannelData(0).buffer,
      mimeType: "audio/wav",
      sampleRate: 44100,
    };
  }
}

/**
 * Factory function to create TTS handler
 */
export function createTTSHandler(config: TTSConfig): TTSHandler {
  switch (config.provider) {
    case "elevenlabs":
      if (!config.apiKey) {
        throw new Error("ElevenLabs API key required");
      }
      return new ElevenLabsTTS(config.apiKey, config.voice);

    case "google":
      if (!config.apiKey) {
        throw new Error("Google Cloud API key required");
      }
      return new GoogleTTS(config.apiKey);

    case "local":
      return new LocalTTS();

    default:
      throw new Error(`Unknown TTS provider: ${config.provider}`);
  }
}
