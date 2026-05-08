import type { NextApiRequest, NextApiResponse } from "next";

const RPC_BASE_URL = (
  process.env.NEXT_PUBLIC_OSMOSIS_RPC_OVERWRITE ?? "https://rpc.osmosis.zone"
).replace(/\/$/, "");

/**
 * Returns the admin address for a tokenfactory denom.
 *
 * The DenomAuthorityMetadata gRPC service is not exposed via the LCD REST
 * gateway ("Not Implemented"). This handler queries it via Tendermint RPC
 * abci_query, encodes the request protobuf manually, and decodes the response.
 *
 * Query param: denom (e.g. factory/osmo1.../subdenom)
 * Response: { authority_metadata: { admin: string } }
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
    const denomBytes = Buffer.from(denom, "utf8");
    // Protobuf encode QueryDenomAuthorityMetadataRequest:
    // field 1 (string denom), wire type 2 → tag 0x0a + length varint + bytes
    const encoded = Buffer.concat([
      Buffer.from([0x0a, denomBytes.length]),
      denomBytes,
    ]);
    const hex = "0x" + encoded.toString("hex");

    const url =
      `${RPC_BASE_URL}/abci_query` +
      `?path=%22%2Fosmosis.tokenfactory.v1beta1.Query%2FDenomAuthorityMetadata%22` +
      `&data=${encodeURIComponent(hex)}`;

    const rpcResponse = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!rpcResponse.ok) {
      return res.status(200).json({ authority_metadata: { admin: "" } });
    }

    const rpcData = (await rpcResponse.json()) as {
      result?: { response?: { value?: string } };
      error?: unknown;
    };

    if (rpcData.error || !rpcData.result?.response?.value) {
      return res.status(200).json({ authority_metadata: { admin: "" } });
    }

    // Decode QueryDenomAuthorityMetadataResponse protobuf:
    //   field 1 (authority_metadata, wire 2) → AuthorityMetadata
    //     field 1 (admin, wire 2) → string
    const bytes = Buffer.from(rpcData.result.response.value, "base64");
    const admin = decodeAdmin(bytes);

    return res.status(200).json({ authority_metadata: { admin: admin ?? "" } });
  } catch {
    return res.status(200).json({ authority_metadata: { admin: "" } });
  }
}

function decodeAdmin(bytes: Buffer): string | undefined {
  let offset = 0;
  while (offset < bytes.length) {
    const tag = bytes[offset++];
    const wire = tag & 0x7;
    const field = tag >> 3;
    if (wire !== 2) break;
    const len = bytes[offset++];
    const value = bytes.slice(offset, offset + len);
    offset += len;
    if (field === 1) {
      let o2 = 0;
      while (o2 < value.length) {
        const t2 = value[o2++];
        const w2 = t2 & 0x7;
        const f2 = t2 >> 3;
        if (w2 !== 2) break;
        const l2 = value[o2++];
        const v2 = value.slice(o2, o2 + l2);
        o2 += l2;
        if (f2 === 1) return v2.toString("utf8");
      }
    }
  }
  return undefined;
}
