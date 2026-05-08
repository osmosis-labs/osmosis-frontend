import type { NextApiRequest, NextApiResponse } from "next";

const LCD_BASE_URL = (
  process.env.NEXT_PUBLIC_OSMOSIS_REST_OVERWRITE ?? "https://lcd.osmosis.zone"
).replace(/\/$/, "");

/**
 * Returns the tokenfactory denoms created by a given address.
 * Query param: creator (bech32 address)
 * Response: { denoms: string[] }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const creator = req.query.creator;
  if (!creator || typeof creator !== "string") {
    return res.status(400).json({ error: "Missing creator query parameter" });
  }

  try {
    const url = `${LCD_BASE_URL}/osmosis/tokenfactory/v1beta1/denoms_from_creator/${encodeURIComponent(creator)}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return res.status(200).json({ denoms: [] });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch {
    return res.status(200).json({ denoms: [] });
  }
}
