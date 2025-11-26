import { NextRequest, NextResponse } from "next/server";
import { createRoomToken } from "@/lib/livekit";
import { getAgent } from "@/lib/agents";

export async function POST(req: NextRequest) {
  try {
    const { roomName, agentId } = await req.json();

    if (!roomName || !agentId) {
      return NextResponse.json(
        { error: "roomName dhe agentId janë të detyrueshme" },
        { status: 400 }
      );
    }

    const agent = getAgent(agentId);
    if (!agent) {
      return NextResponse.json(
        { error: "Agent i panjohur" },
        { status: 400 }
      );
    }

    const identity = `agent-${agent.id}-${Date.now()}`;

    const token = createRoomToken({
      roomName,
      identity,
      metadata: {
        role: "agent",
        agentId: agent.id,
        agentName: agent.name,
        agentRole: agent.role,
      },
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    return NextResponse.json({
      ok: true,
      token,
      identity,
      agent: {
        id: agent.id,
        name: agent.name,
        role: agent.role,
      },
    });
  } catch (err) {
    console.error("[spawn-agent]", err);
    return NextResponse.json(
      { error: "Failed to spawn agent" },
      { status: 500 }
    );
  }
}
