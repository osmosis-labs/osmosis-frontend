import type { NextApiRequest, NextApiResponse } from "next";

const LCD_BASE_URL = (
  process.env.NEXT_PUBLIC_OSMOSIS_REST_OVERWRITE ?? "https://lcd.osmosis.zone"
).replace(/\/$/, "");

/**
 * Returns the total on-chain supply for a specific denom.
 * Query param: denom
 * Response: { amount: { denom: string, amount: string } }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const denom = req.query.denom;
  if (!denom || typeof denom !== "string") {
    return res.status(400).json({ error: "Missing denom query parameter" });
  }

  try {
    const url = `${LCD_BASE_URL}/cosmos/bank/v1beta1/supply/by_denom?denom=${encodeURIComponent(denom)}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return res.status(200).json({ amount: { denom, amount: "0" } });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch {
    return res.status(200).json({ amount: { denom, amount: "0" } });
  }
}
