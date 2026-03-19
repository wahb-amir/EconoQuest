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
      .order("raw_score", { ascending: false });

    if (error) throw error;

    const nationMap = new Map<string, {
      difficulty: string;
      top_score:  number;
      entries:    any[];
    }>();

    for (const row of (data ?? [])) {
      if (!nationMap.has(row.nation_name)) {
        nationMap.set(row.nation_name, {
          difficulty: row.difficulty,
          top_score:  row.raw_score,
          entries:    [],
        });
      }
      const nation = nationMap.get(row.nation_name)!;
      if (nation.entries.length < 3) nation.entries.push(row);
      if (row.raw_score > nation.top_score) nation.top_score = row.raw_score;
    }

    const nations = Array.from(nationMap.entries())
      .sort((a, b) => b[1].top_score - a[1].top_score)
      .map(([nation_name, v]) => ({
        nation_name,
        difficulty:  v.difficulty,
        top_score:   v.top_score,
        top_entries: v.entries.map((e, i) => ({
          rank:           i + 1,
          player_name:    e.player_name,
          raw_score:      e.raw_score,
          weighted_score: e.weighted_score,
          archetype:      e.archetype,
          difficulty:     e.difficulty,
        })),
      }));

    return NextResponse.json({ nations });
  } catch (err: any) {
    return NextResponse.json({ nations: [], error: err.message }, { status: 500 });
  }
}