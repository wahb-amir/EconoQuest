import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("econoquest_scores")
      .select("player_name, nation_name, difficulty, raw_score, weighted_score, archetype")
      .order("weighted_score", { ascending: false })
      .limit(100);

    if (error) throw error;

    // one entry per player — their best weighted score
    const seen   = new Set<string>();
    const unique = (data ?? []).filter((row: { player_name: string; }) => {
      if (seen.has(row.player_name)) return false;
      seen.add(row.player_name);
      return true;
    }).slice(0, 50);

    return NextResponse.json({ entries: unique });
  } catch (err: any) {
    return NextResponse.json({ entries: [], error: err.message }, { status: 500 });
  }
}