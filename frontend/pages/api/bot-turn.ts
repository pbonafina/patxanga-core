import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

type BotTurnResponse =
  | {
      ok: true;
      result: unknown;
    }
  | {
      ok: false;
      error: string;
    };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<BotTurnResponse>
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  const matchId = request.body?.matchId;
  const playerId = request.body?.playerId;

  if (!isNonEmptyString(matchId) || !isNonEmptyString(playerId)) {
    response.status(400).json({ ok: false, error: "matchId and playerId are required." });
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    response.status(500).json({ ok: false, error: "Supabase environment is not configured." });
    return;
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await client.rpc("submit_patxanga_easy_bot_turn", {
    p_match_id: matchId.trim(),
    p_player_id: playerId.trim(),
  });

  if (error) {
    response.status(500).json({ ok: false, error: error.message });
    return;
  }

  response.status(200).json({ ok: true, result: data ?? null });
}
