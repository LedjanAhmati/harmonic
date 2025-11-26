# 🎥 Harmonic Trinity - Video Rooms with LiveKit

Real-time video conferencing with AI agents/personas using LiveKit.

## Architecture

### Components

1. **Rooms Lobby** (`/app/rooms/page.tsx`)
   - Join or create a video room
   - Enter username for identification
   - Clean, modern UI

2. **Room Page** (`/app/rooms/[roomName]/page.tsx`)
   - Video conference with LiveKit
   - AI personas panel on right side
   - Add/remove agents dynamically
   - Real-time participant management

3. **AI Agents** (`/lib/agents.ts`)
   - 5 default personas: Coach, Therapist, Strategist, Analyst, Advisor
   - Each with emoji, name, and description
   - Configurable roles and capabilities

### API Routes

#### 1. `/api/livekit-token` (POST)
Generate tokens for users to join rooms

**Request:**
```json
{
  "roomName": "support-room",
  "identity": "alice@example.com",
  "metadata": { "role": "user" }
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "serverUrl": "wss://livekit-server"
}
```

#### 2. `/api/spawn-agent` (POST)
Create a token for an AI agent to join a room

**Request:**
```json
{
  "roomName": "support-room",
  "agentId": "coach"
}
```

**Response:**
```json
{
  "ok": true,
  "token": "jwt_token_here",
  "identity": "agent-coach-1234567890",
  "agent": {
    "id": "coach",
    "name": "Coach AI",
    "role": "coach"
  }
}
```

## Setup

### 1. Environment Variables

Add to `.env.local`:

```env
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
LIVEKIT_URL=wss://your-livekit-host
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-host
```

For production, get real credentials from [cloud.livekit.io](https://cloud.livekit.io)

### 2. Local Testing with Docker

Run LiveKit server locally:

```bash
docker run --rm -it \
  -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882/udp \
  livekit/livekit-server \
  --dev --config /etc/livekit.yaml
```

Update `.env.local`:
```env
LIVEKIT_URL=ws://localhost:7880
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
```

### 3. Deploy

For production deployment:

1. Set up LiveKit Cloud instance at [cloud.livekit.io](https://cloud.livekit.io)
2. Get API key and secret
3. Update environment variables
4. Deploy Next.js app

## Features

### Current (✅ Done)

- [x] Video conferencing with LiveKit
- [x] Room creation and joining
- [x] AI personas panel
- [x] Agent spawning endpoints
- [x] Token generation (users & agents)
- [x] Responsive UI (desktop + mobile)
- [x] Metadata tracking (user/agent roles)

### Next Phase (🔄 In Progress)

- [ ] Bot worker that connects agents to room
- [ ] Audio transcription (STT)
- [ ] LLM integration (reasoning + response generation)
- [ ] Text-to-speech (TTS) for agent responses
- [ ] Real-time chat alongside video
- [ ] Recording and playback
- [ ] Screen sharing

## Bot Worker Implementation (Next)

The bot worker will:

1. Receive agent spawn event (roomName, agentId, token)
2. Connect to LiveKit room with agent token
3. Subscribe to audio tracks from other participants
4. Process audio with STT (e.g., Deepgram, Whisper)
5. Send transcription to LLM (OpenAI Realtime API)
6. Get agent response
7. Convert response to audio (TTS)
8. Publish audio back to room

Example structure:

```
/workers/
  ├── agent-bot.ts          # Main bot process
  ├── transcription.ts      # STT handling
  ├── llm-handler.ts        # LLM calls
  ├── tts-handler.ts        # TTS handling
  └── queue-worker.ts       # Listen for spawn events
```

## File Structure

```
app/
  ├── rooms/
  │   ├── page.tsx           # Lobby
  │   └── [roomName]/
  │       └── page.tsx       # Room page
  ├── api/
  │   ├── livekit-token/route.ts
  │   └── spawn-agent/route.ts
  └── layout.tsx             # Add LiveKit CSS

lib/
  ├── livekit.ts             # Token generation
  └── agents.ts              # Agent configuration
```

## Usage

### For Users

1. Go to `/rooms`
2. Enter room name and username
3. Click "Join Room"
4. In the room, click agents to add them
5. Start video call with AI personas

### For Agents (Bot Workers)

```typescript
import { createRoomToken, NEXT_PUBLIC_LIVEKIT_URL } from "@/lib/livekit";

const token = await fetch("/api/spawn-agent", {
  method: "POST",
  body: JSON.stringify({
    roomName: "my-room",
    agentId: "coach"
  })
}).then(r => r.json());

// Connect bot to room with token.token
// Subscribe to audio and send back responses
```

## Dependencies

- `livekit-server-sdk` - Token generation
- `livekit-client` - Browser WebRTC client
- `@livekit/components-react` - Pre-built React components

## References

- [LiveKit Documentation](https://docs.livekit.io)
- [LiveKit Components React](https://github.com/livekit-examples/components-js)
- [LiveKit Server SDK](https://github.com/livekit/server-sdk-js)
