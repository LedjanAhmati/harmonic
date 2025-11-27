/**
 * Speech-to-Text Handler
 * Abstracts multiple STT providers (Deepgram, Whisper, local)
 */

export interface STTConfig {
  provider: "deepgram" | "whisper" | "local";
  apiKey?: string;
  model?: string;
  language?: string;
}

export interface STTResult {
  text: string;
  confidence: number;
  language?: string;
  isFinal: boolean;
}

/**
 * Base STT class
 */
export abstract class STTHandler {
  protected config: STTConfig;

  constructor(config: STTConfig) {
    this.config = config;
  }

  abstract transcribe(
    audioBuffer: ArrayBuffer,
    sampleRate: number
  ): Promise<STTResult>;

  abstract supportsStreaming(): boolean;
}

/**
 * Deepgram STT Implementation
 * High accuracy, low latency
 */
export class DeepgramSTT extends STTHandler {
  private apiKey: string;
  private apiUrl = "https://api.deepgram.com/v1/listen";

  constructor(apiKey: string) {
    super({ provider: "deepgram", apiKey });
    this.apiKey = apiKey;
  }

  async transcribe(audioBuffer: ArrayBuffer, sampleRate: number): Promise<STTResult> {
    try {
      const response = await fetch(
        `${this.apiUrl}?model=nova-2&language=${this.config.language || "en"}`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${this.apiKey}`,
            "Content-Type": "audio/raw;rate=" + sampleRate,
          },
          body: audioBuffer,
        }
      );

      if (!response.ok) {
        throw new Error(`Deepgram error: ${response.status}`);
      }

      const result = await response.json();

      return {
        text: result.results?.channels?.[0]?.alternatives?.[0]?.transcript || "",
        confidence: result.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0,
        language: this.config.language,
        isFinal: result.is_final || true,
      };
    } catch (error) {
      console.error("Deepgram STT error:", error);
      throw error;
    }
  }

  supportsStreaming(): boolean {
    return true;
  }
}

/**
 * OpenAI Whisper STT Implementation
 * Very accurate, good for batch processing
 */
export class WhisperSTT extends STTHandler {
  private apiKey: string;
  private apiUrl = "https://api.openai.com/v1/audio/transcriptions";

  constructor(apiKey: string) {
    super({ provider: "whisper", apiKey });
    this.apiKey = apiKey;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transcribe(audioBuffer: ArrayBuffer, sampleRate: number): Promise<STTResult> {
    try {
      const formData = new FormData();
      const blob = new Blob([audioBuffer], { type: "audio/wav" });
      formData.append("file", blob, "audio.wav");
      formData.append("model", "whisper-1");
      if (this.config.language) {
        formData.append("language", this.config.language);
      }

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Whisper error: ${response.status}`);
      }

      const result = await response.json();

      return {
        text: result.text || "",
        confidence: 0.95, // Whisper doesn't provide confidence
        language: result.language,
        isFinal: true,
      };
    } catch (error) {
      console.error("Whisper STT error:", error);
      throw error;
    }
  }

  supportsStreaming(): boolean {
    return false;
  }
}

/**
 * Local STT stub (for development)
 */
export class LocalSTT extends STTHandler {
  constructor() {
    super({ provider: "local" });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transcribe(audioBuffer: ArrayBuffer, sampleRate: number): Promise<STTResult> {
    // Stub: would use browser Web Speech API or local model
    return {
      text: "[Local STT - not implemented]",
      confidence: 0,
      isFinal: true,
    };
  }

  supportsStreaming(): boolean {
    return true;
  }
}

/**
 * Factory function to create STT handler
 */
export function createSTTHandler(config: STTConfig): STTHandler {
  switch (config.provider) {
    case "deepgram":
      if (!config.apiKey) {
        throw new Error("Deepgram API key required");
      }
      return new DeepgramSTT(config.apiKey);

    case "whisper":
      if (!config.apiKey) {
        throw new Error("Whisper (OpenAI) API key required");
      }
      return new WhisperSTT(config.apiKey);

    case "local":
      return new LocalSTT();

    default:
      throw new Error(`Unknown STT provider: ${config.provider}`);
  }
}
