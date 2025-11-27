# 🤖 Harmonic Trinity - AI Bot Workers

Real-time AI agents that join video rooms and participate in conversations using voice.

## Architecture

...
User/Bot in Room
       ↓
LiveKit Room (WebRTC)
       ↓
AgentBot (workers/agent-bot.ts)
├── Audio Capture (LiveKit track subscription)
├── STT Handler (speech-to-text)
├── LLM Handler (AI response generation)
├── TTS Handler (text-to-speech)
└── Audio Publishing (LiveKit track publish)
...

## Components

### 1. **AgentBot** (`agent-bot.ts`)

Main orchestrator that manages room connection and audio flow.

**Features:**

- LiveKit room connection with agent token
- Real-time audio track subscription from participants
- Audio buffering and chunking
- Pipeline: Audio → STT → LLM → TTS → Publish

**Usage:**

```typescript
import { AgentBot, AgentBotConfig } from "@/workers/agent-bot";

const config: AgentBotConfig = {
  roomName: "support-session",
  agentId: "coach",
  agentName: "Coach AI",
  identity: "agent-coach-12345",
  token: "jwt_token_from_spawn_agent",
  serverUrl: "wss://livekit-server",
  llmProvider: "openai",
  sttProvider: "deepgram",
  ttsProvider: "elevenlabs",
};

const bot = new AgentBot(config);
await bot.connect();
// Bot is now in the room, listening and responding

const status = bot.getStatus();
// { agent: "Coach AI", roomName: "support-session", connected: true, participantCount: 2 }

await bot.disconnect();
```

### 2. **STT Handler** (`transcription-handler.ts`)

Converts speech to text with multiple provider support.

**Supported Providers:**

- **Deepgram** - High accuracy, streaming, real-time
- **OpenAI Whisper** - Very accurate, batch processing
- **Local** - Browser Web Speech API (stub)

**Usage:**

```typescript
import { createSTTHandler } from "@/workers/transcription-handler";

const stt = createSTTHandler({
  provider: "deepgram",
  apiKey: process.env.DEEPGRAM_API_KEY,
  language: "en",
});

const result = await stt.transcribe(audioBuffer, 48000);
// { text: "hello world", confidence: 0.98, isFinal: true }
```

### 3. **LLM Handler** (`llm-handler.ts`)

Generates AI responses with agent personality context.

**Supported Providers:**

- **OpenAI** - GPT-4 for highest quality
- **Anthropic** - Claude 3 for reasoning
- **Local** - Stub for development

**Agent Personalities:**

- **Coach** - Motivational, action-focused
- **Therapist** - Compassionate, supportive
- **Strategist** - Strategic, analytical
- **Analyst** - Data-driven, factual
- **Advisor** - Wise, balanced perspective

**Usage:**

```typescript
import { createLLMHandler } from "@/workers/llm-handler";
import { getAgent } from "@/lib/agents";

const llm = createLLMHandler({
  provider: "openai",
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo-preview",
  temperature: 0.7,
});

const agent = getAgent("coach");
const response = await llm.generateResponse(
  "How can I be more productive?",
  agent
);
// { text: "That's a great question! Here's what I think...", usage: {...} }
```

### 4. **TTS Handler** (`tts-handler.ts`)

Converts text to natural-sounding speech.

**Supported Providers:**

- **ElevenLabs** - High-quality, natural voices
- **Google Cloud** - Good quality, affordable
- **Local** - Browser SpeechSynthesis API (stub)

**Usage:**

```typescript
import { createTTSHandler } from "@/workers/tts-handler";

const tts = createTTSHandler({
  provider: "elevenlabs",
  apiKey: process.env.ELEVENLABS_API_KEY,
  voice: "21m00Tcm4TlvDq8ikWAM", // Rachel voice
  speed: 1.0,
});

const result = await tts.synthesize("Hello! How can I help you?");
// { audioBuffer: ArrayBuffer, mimeType: "audio/mpeg", sampleRate: 22050 }
```

## Setup

### 1. Environment Variables

Add to `.env.local`:

```env
# STT Provider
DEEPGRAM_API_KEY=your_deepgram_key
# OR
OPENAI_API_KEY=your_openai_key

# LLM Provider
OPENAI_API_KEY=your_openai_key
# OR
ANTHROPIC_API_KEY=your_anthropic_key

# TTS Provider
ELEVENLABS_API_KEY=your_elevenlabs_key
# OR
GOOGLE_CLOUD_API_KEY=your_google_key
```

### 2. Get API Keys

**Deepgram** (STT)

- Sign up: https: //console.deepgram.com
- Create API key
- Free tier: ~$1.50/hour of speech

**OpenAI** (LLM + STT option)

- Sign up: https: //platform.openai.com
- Create API key
- Pricing: ~$0.01-0.03 per 1K tokens

**Anthropic** (Alternative LLM)

- Sign up: https: //console.anthropic.com
- Create API key
- Pricing: Competitive with OpenAI

**ElevenLabs** (TTS)

- Sign up: https: //elevenlabs.io
- Create API key
- Free tier: 10,000 characters/month

**Google Cloud** (Alternative TTS)

- Set up project: https: //cloud.google.com
- Enable Text-to-Speech API
- Pricing: $16/1M characters (cheaper at scale)

## Full Pipeline Example

```typescript
import { AgentBot } from "@/workers/agent-bot";
import { createSTTHandler } from "@/workers/transcription-handler";
import { createLLMHandler } from "@/workers/llm-handler";
import { createTTSHandler } from "@/workers/tts-handler";

// 1. Get token for agent from frontend
const tokenRes = await fetch("/api/spawn-agent", {
  method: "POST",
  body: JSON.stringify({
    roomName: "coaching-session",
    agentId: "coach",
  }),
});
const { token } = await tokenRes.json();

// 2. Configure bot with all handlers
const bot = new AgentBot({
  roomName: "coaching-session",
  agentId: "coach",
  agentName: "Coach AI",
  identity: `agent-coach-${Date.now()}`,
  token,
  serverUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL,
  llmProvider: "openai",
  sttProvider: "deepgram",
  ttsProvider: "elevenlabs",
});

// 3. Connect and listen
await bot.connect();
console.log("✓ Coach is in the room");

// 4. When user speaks in room:
// AgentBot internally:
// ├─ Captures audio from room
// ├─ Transcribes with Deepgram
// ├─ Sends to OpenAI with Coach personality
// ├─ Converts response to speech with ElevenLabs
// └─ Publishes audio back to room

// 5. Cleanup
setTimeout(() => bot.disconnect(), 3600000); // 1 hour
```

## Performance & Cost

### Per-Minute Costs (Rough Estimates)

| Component | Cost | Notes |
|-----------|------|-------|
| **STT (Deepgram)** | $0.0025/min | High accuracy, real-time |
| **LLM (GPT-4)** | $0.01-0.03/min | Depends on tokens used |
| **TTS (ElevenLabs)** | $0.005-0.01/min | Natural voices |
| **LiveKit** | Variable | Room hosting cost |
| **TOTAL** | ~$0.02-0.05/min | ~$1.20-3/hour |

### Example: 30-Min Coaching Session

- STT: $0.075
- LLM: $0.30-0.90
- TTS: $0.15-0.30
- **Total: ~$0.50-1.50**

## Architecture & Latency

...
User speaks → Captured (100ms)
           → STT (500-1000ms)
           → LLM (1000-2000ms)
           → TTS (500-1000ms)
           → Published (100ms)
           ________________
           Total: 2-4 seconds
...

Goal: Reduce to <2 seconds with streaming APIs.

## Next Steps

1. **Streaming STT** - Real-time transcription (reduces latency)
2. **OpenAI Realtime API** - Native STT+LLM+TTS (lowest latency)
3. **Fallback Handlers** - If primary provider fails, use secondary
4. **Voice Cloning** - Custom voices for agents
5. **Multi-Agent Orchestration** - Multiple agents speaking (with conflict resolution)
6. **Recording & Analytics** - Analyze conversations, generate summaries

## Files

...
workers/
├── agent-bot.ts                 # Main bot orchestrator
├── transcription-handler.ts     # STT abstraction (Deepgram, Whisper, local)
├── llm-handler.ts               # LLM abstraction (OpenAI, Anthropic, local)
├── tts-handler.ts               # TTS abstraction (ElevenLabs, Google, local)
└── README.md                    # This file
...

## Troubleshooting

-**"Index out of bounds" when subscribing to audio**

- Ensure participant has published audio track before subscribing
- Wait for `ParticipantEvent.TrackSubscribed` event

-**STT returning empty text**

- Check audio buffer format (must be 16-bit PCM)
- Verify audio has enough loudness/content
- Check API key validity

- Ensure agent personality prompt is correct
- Check temperature setting (higher = more creative)
- Verify API key has sufficient quota

-**TTS audio is distorted**

- Audio buffer might not be properly formatted
- Check sample rate conversion
- Try different TTS provider

## License

Part of Harmonic Trinity - MIT License
