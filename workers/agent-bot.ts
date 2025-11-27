/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Harmonic Trinity - AI Agent Bot Worker
 * Connects to LiveKit rooms and handles agent interactions
 * 
 * Flow:
 * 1. Bot joins room with agent token
 * 2. Subscribes to participant audio tracks
 * 3. Transcribes audio with STT
 * 4. Sends to LLM for response
 * 5. Converts response to speech with TTS
 * 6. Publishes audio back to room
 */

import { Room, RoomEvent, ParticipantEvent } from "livekit-client";

export interface AgentBotConfig {
  roomName: string;
  agentId: string;
  agentName: string;
  identity: string;
  token: string;
  serverUrl: string;
  // LLM configuration
  llmProvider?: "openai" | "anthropic" | "local";
  llmModel?: string;
  // STT configuration
  sttProvider?: "deepgram" | "whisper" | "local";
  // TTS configuration
  ttsProvider?: "elevenlabs" | "google" | "local";
}

export interface TranscriptionResult {
  text: string;
  language?: string;
  confidence?: number;
  speaker?: string;
}

export interface LLMResponse {
  text: string;
  reasoning?: string;
  confidence?: number;
}

export interface AudioData {
  buffer: ArrayBuffer;
  sampleRate: number;
  channels: number;
}

/**
 * Main Agent Bot class
 * Handles room connection, audio processing, and LLM integration
 */
export class AgentBot {
  private config: AgentBotConfig;
  private room: Room | null = null;
  private isConnected = false;
  private audioContext: AudioContext | null = null;

  // Audio buffers for each participant
  private participantAudioBuffers: Map<string, Float32Array[]> = new Map();
  private participantSampleRates: Map<string, number> = new Map();

  constructor(config: AgentBotConfig) {
    this.config = config;
  }

  /**
   * Initialize and connect bot to LiveKit room
   */
  async connect(): Promise<void> {
    try {
      console.log(`[${this.config.agentName}] Connecting to room: ${this.config.roomName}`);

      this.room = new Room({
        audio: true,
        video: false, // Audio-only for agent
        adaptiveStream: true,
        dynacast: true,
      } as any);

      // Setup event handlers
      this.setupEventHandlers();

      // Connect to room
      await this.room.connect(this.config.serverUrl, this.config.token);

      this.isConnected = true;
      console.log(`[${this.config.agentName}] ✓ Connected to room`);
    } catch (error) {
      console.error(`[${this.config.agentName}] Connection failed:`, error);
      throw error;
    }
  }

  /**
   * Setup LiveKit event handlers
   */
  private setupEventHandlers(): void {
    if (!this.room) return;

    // When participant joins
    this.room.on(RoomEvent.ParticipantConnected, (participant) => {
      console.log(`[${this.config.agentName}] Participant joined: ${participant.identity}`);

      // Subscribe to audio tracks
      participant.on(ParticipantEvent.TrackSubscribed, (track) => {
        if (track.kind === "audio") {
          console.log(
            `[${this.config.agentName}] Subscribed to audio: ${participant.identity}`
          );
          this.handleAudioTrack(track, participant.identity);
        }
      });
    });

    // When participant leaves
    this.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      console.log(`[${this.config.agentName}] Participant left: ${participant.identity}`);
      this.participantAudioBuffers.delete(participant.identity);
      this.participantSampleRates.delete(participant.identity);
    });

    // Connection quality events
    this.room.on(RoomEvent.ConnectionQualityChanged, (quality) => {
      console.log(`[${this.config.agentName}] Connection quality: ${quality}`);
    });

    // Disconnection
    this.room.on(RoomEvent.Disconnected, () => {
      console.log(`[${this.config.agentName}] Disconnected from room`);
      this.isConnected = false;
    });
  }

  /**
   * Handle incoming audio track from participant
   */
  private async handleAudioTrack(
    track: unknown,
    participantId: string
  ): Promise<void> {
    try {
      // Create audio context if needed
      if (!this.audioContext) {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
      }

      const mediaStream = new MediaStream([track as MediaStreamTrack]);
      const audioSource = this.audioContext!.createMediaStreamSource(mediaStream);
      const processor = this.audioContext!.createScriptProcessor(4096, 1, 1);

      // Initialize buffer for this participant
      if (!this.participantAudioBuffers.has(participantId)) {
        this.participantAudioBuffers.set(participantId, []);
        this.participantSampleRates.set(participantId, this.audioContext!.sampleRate);
      }

      const buffers = this.participantAudioBuffers.get(participantId)!;

      // Collect audio data
      processor.onaudioprocess = (event) => {
        const audioData = event.inputBuffer.getChannelData(0);
        buffers.push(new Float32Array(audioData));

        // Process when we have enough data (e.g., 1 second chunks at 16kHz)
        if (buffers.length >= 16) {
          this.processAudioChunk(buffers, participantId);
          buffers.length = 0;
        }
      };

      audioSource.connect(processor);
      processor.connect(this.audioContext!.destination);
    } catch (error) {
      console.error(`[${this.config.agentName}] Error handling audio track:`, error);
    }
  }

  /**
   * Process audio chunk: STT -> LLM -> TTS
   */
  private async processAudioChunk(
    audioBuffers: Float32Array[],
    participantId: string
  ): Promise<void> {
    try {
      // Convert audio buffers to AudioData
      const audioData = this.convertToAudioData(audioBuffers, participantId);

      // Step 1: Transcribe audio
      const transcription = await this.transcribeAudio(audioData);
      console.log(
        `[${this.config.agentName}] Transcribed from ${participantId}: "${transcription.text}"`
      );

      // Step 2: Get LLM response
      const llmResponse = await this.getLLMResponse(
        transcription.text,
        participantId,
        this.config.agentId
      );
      console.log(`[${this.config.agentName}] LLM Response: "${llmResponse.text}"`);

      // Step 3: Convert to speech
      const audioBuffer = await this.synthesizeSpeech(llmResponse.text);

      // Step 4: Publish audio to room
      await this.publishAudio(audioBuffer);
    } catch (error) {
      console.error(`[${this.config.agentName}] Error processing audio:`, error);
    }
  }

  /**
   * Convert audio buffers to AudioData format
   */
  private convertToAudioData(
    audioBuffers: Float32Array[],
    participantId: string
  ): AudioData {
    // Combine all buffers
    const totalLength = audioBuffers.reduce((sum, buf) => sum + buf.length, 0);
    const combined = new Float32Array(totalLength);
    let offset = 0;

    for (const buf of audioBuffers) {
      combined.set(buf, offset);
      offset += buf.length;
    }

    // Convert to 16-bit PCM
    const pcm16 = this.floatTo16BitPCM(combined);

    return {
      buffer: pcm16.buffer as ArrayBuffer,
      sampleRate: this.participantSampleRates.get(participantId) || 48000,
      channels: 1,
    };
  }

  /**
   * Convert float32 audio to 16-bit PCM
   */
  private floatTo16BitPCM(float32Data: Float32Array): Int16Array {
    const pcm16 = new Int16Array(float32Data.length);
    for (let i = 0; i < float32Data.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Data[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return pcm16;
  }

  /**
   * Transcribe audio to text (stub - implement with STT provider)
   */
  private async transcribeAudio(audioData: AudioData): Promise<TranscriptionResult> {
    // TODO: Integrate with STT provider (Deepgram, Whisper, etc.)
    // For now, return stub
    return {
      text: "[Transcription would go here]",
      language: "en",
      confidence: 0.95,
    };
  }

  /**
   * Get response from LLM (stub - implement with LLM provider)
   */
  private async getLLMResponse(
    userText: string,
    _participantId: string,
    _agentId: string
  ): Promise<LLMResponse> {
    // TODO: Call LLM (OpenAI, Anthropic, etc.)
    // Include agent personality/role
    // For now, return stub
    return {
      text: `[${this.config.agentName} response to: "${userText}"]`,
      confidence: 0.9,
    };
  }

  /**
   * Synthesize text to speech (stub - implement with TTS provider)
   */
  private async synthesizeSpeech(text: string): Promise<AudioBuffer> {
    // TODO: Integrate with TTS provider (ElevenLabs, Google, etc.)
    // For now, create empty audio buffer
    if (!this.audioContext) {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
    }
    return this.audioContext!.createBuffer(1, 44100, 44100);
  }

  /**
   * Publish audio to room as participant audio track
   */
  private async publishAudio(audioBuffer: AudioBuffer): Promise<void> {
    if (!this.room) return;

    try {
      // TODO: Create audio track from buffer and publish to room
      console.log(`[${this.config.agentName}] Publishing audio response...`);
    } catch (error) {
      console.error(`[${this.config.agentName}] Error publishing audio:`, error);
    }
  }

  /**
   * Disconnect bot from room
   */
  async disconnect(): Promise<void> {
    if (this.room) {
      await this.room.disconnect();
      this.isConnected = false;
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    console.log(`[${this.config.agentName}] Disconnected`);
  }

  /**
   * Get bot status
   */
  getStatus() {
    return {
      agent: this.config.agentName,
      roomName: this.config.roomName,
      connected: this.isConnected,
      participantCount: this.room?.numParticipants || 0,
    };
  }
}

export default AgentBot;
