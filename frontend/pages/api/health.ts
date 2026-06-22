import type { NextApiRequest, NextApiResponse } from "next";

type HealthResponse = {
  status: "ok";
  service: "patxanga-frontend";
  timestamp: string;
  supabase: {
    urlConfigured: boolean;
    anonKeyConfigured: boolean;
  };
};

export default function handler(
  _request: NextApiRequest,
  response: NextApiResponse<HealthResponse>
) {
  response.status(200).json({
    status: "ok",
    service: "patxanga-frontend",
    timestamp: new Date().toISOString(),
    supabase: {
      urlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      anonKeyConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    },
  });
}
