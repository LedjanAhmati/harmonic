import { AccessToken } from "livekit-server-sdk";

const apiKey = process.env.LIVEKIT_API_KEY!;
const apiSecret = process.env.LIVEKIT_API_SECRET!;
const livekitUrl = process.env.LIVEKIT_URL!;

if (!apiKey || !apiSecret || !livekitUrl) {
  throw new Error(
    "Missing LIVEKIT env vars - Set LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL in .env.local"
  );
}

export interface TokenOptions {
  roomName: string;
  identity: string;
  metadata?: Record<string, unknown>;
  canPublish?: boolean;
  canSubscribe?: boolean;
  canPublishData?: boolean;
}

/**
 * Generate a LiveKit access token for a user or agent
 * @param opts - Token configuration
 * @returns JWT token for connecting to LiveKit room
 */
export function createRoomToken(opts: TokenOptions): string {
  const token = new AccessToken(apiKey, apiSecret, {
    identity: opts.identity,
    ttl: 60 * 60 * 4, // 4 hours
  });

  token.addGrant({
    roomJoin: true,
    room: opts.roomName,
    canPublish: opts.canPublish ?? true,
    canSubscribe: opts.canSubscribe ?? true,
    canPublishData: opts.canPublishData ?? true,
  });

  if (opts.metadata) {
    token.metadata = JSON.stringify(opts.metadata);
  }

  return token.toJwt();
}

export const LIVEKIT_URL = livekitUrl;
export const NEXT_PUBLIC_LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL!;
