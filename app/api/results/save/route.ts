import { NextResponse } from "next/server";

// POST /api/results/save
export async function POST(req: Request) {
  try {
    const { userId, result } = await req.json();

    if (!userId || !result) {
      return NextResponse.json(
        { ok: false, error: "missing_parameters" },
        { status: 400 }
      );
    }

    // TODO: Save to database (Supabase, PlanetScale, etc)
    console.log("Saving result:", { userId, result });

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("Save error:", err);
    return NextResponse.json(
      { ok: false, error: "save_error" },
      { status: 500 }
    );
  }
}
