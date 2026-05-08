import type { NextApiRequest, NextApiResponse } from "next";

const LCD_BASE_URL = (
  process.env.NEXT_PUBLIC_OSMOSIS_REST_OVERWRITE ?? "https://lcd.osmosis.zone"
).replace(/\/$/, "");

/**
 * Returns all bank denom metadata entries.
 * Response: { metadatas: DenomMetadata[] }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const url = `${LCD_BASE_URL}/cosmos/bank/v1beta1/denoms_metadata?pagination.limit=10000`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return res.status(200).json({ metadatas: [] });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch {
    return res.status(200).json({ metadatas: [] });
  }
}
