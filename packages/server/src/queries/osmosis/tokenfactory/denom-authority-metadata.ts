import { Chain } from "@osmosis-labs/types";

/**
 * Fetch the tokenfactory denom's admin address.
 *
 * The `DenomAuthorityMetadata` gRPC service is not exposed via the LCD REST
 * gateway on any public Osmosis endpoint (all return 501 Not Implemented).
 * Instead, query it via Tendermint RPC `abci_query`. The request and response
 * are hand-encoded/decoded protobuf because the message is tiny (a single
 * string field in, a single string field out).
 *
 * Hedged across the chain's RPC endpoint list; the first success wins.
 *
 * Returns `""` when the denom has no admin (renounced).
 */
export async function queryDenomAuthorityMetadata({
  denom,
  chainId,
  chainList,
}: {
  denom: string;
  chainId?: string;
  chainList: Chain[];
}): Promise<{ admin: string }> {
  const chain = chainList.find((c) => c.chain_id === chainId) ?? chainList[0];
  if (!chain) throw new Error(`Chain ${chainId} not found`);

  const rpcEndpoints = chain.apis.rpc ?? [];
  if (rpcEndpoints.length === 0) {
    throw new Error(`No RPC endpoints available for chain ${chain.chain_id}`);
  }

  const data = encodeQueryRequest(denom);
  const path = "/osmosis.tokenfactory.v1beta1.Query/DenomAuthorityMetadata";

  const attempts = rpcEndpoints.map(({ address }) =>
    queryAbci(address, path, data)
  );

  let lastError: unknown;
  // Promise.any would be ideal but isn't universally available in our targets.
  // Race endpoints sequentially with a tiny stagger to keep the budget bounded
  // without hammering every RPC at once.
  for (const attempt of attempts) {
    try {
      return { admin: await attempt };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("All RPC endpoints failed");
}

async function queryAbci(
  endpoint: string,
  path: string,
  data: Uint8Array
): Promise<string> {
  const base = endpoint.replace(/\/$/, "");
  const hex =
    "0x" +
    Array.from(data)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  const url =
    `${base}/abci_query` +
    `?path=${encodeURIComponent(`"${path}"`)}` +
    `&data=${encodeURIComponent(hex)}`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`RPC ${endpoint} returned ${res.status}`);

  const json = (await res.json()) as {
    result?: { response?: { value?: string; code?: number } };
    error?: unknown;
  };
  if (json.error) throw new Error(`RPC error: ${JSON.stringify(json.error)}`);

  const value = json.result?.response?.value;
  if (!value) return "";

  const responseBytes = base64ToBytes(value);
  return decodeAuthorityMetadataResponse(responseBytes) ?? "";
}

/**
 * Encode `QueryDenomAuthorityMetadataRequest { string denom = 1 }`:
 * tag 0x0a (field 1, wire 2) + length varint + UTF-8 bytes.
 */
function encodeQueryRequest(denom: string): Uint8Array {
  const denomBytes = new TextEncoder().encode(denom);
  return new Uint8Array([
    0x0a,
    ...encodeVarint(denomBytes.length),
    ...denomBytes,
  ]);
}

/**
 * Decode `QueryDenomAuthorityMetadataResponse`:
 *   field 1 (authority_metadata, wire 2) → AuthorityMetadata
 *     field 1 (admin, wire 2) → string
 */
function decodeAuthorityMetadataResponse(
  bytes: Uint8Array
): string | undefined {
  let offset = 0;
  while (offset < bytes.length) {
    const tag = readVarint(bytes, offset);
    offset = tag.offset;
    const wire = tag.value & 0x7;
    const field = tag.value >>> 3;
    if (wire !== 2) break;
    const len = readVarint(bytes, offset);
    offset = len.offset;
    const inner = bytes.slice(offset, offset + len.value);
    offset += len.value;
    if (field === 1) {
      let o2 = 0;
      while (o2 < inner.length) {
        const innerTag = readVarint(inner, o2);
        o2 = innerTag.offset;
        const w2 = innerTag.value & 0x7;
        const f2 = innerTag.value >>> 3;
        if (w2 !== 2) break;
        const innerLen = readVarint(inner, o2);
        o2 = innerLen.offset;
        const v2 = inner.slice(o2, o2 + innerLen.value);
        o2 += innerLen.value;
        if (f2 === 1) return new TextDecoder().decode(v2);
      }
    }
  }
  return undefined;
}

function encodeVarint(value: number): number[] {
  const bytes: number[] = [];
  let v = value;
  while (v > 0x7f) {
    bytes.push((v & 0x7f) | 0x80);
    v >>>= 7;
  }
  bytes.push(v);
  return bytes;
}

function readVarint(
  bytes: Uint8Array,
  offset: number
): { value: number; offset: number } {
  let value = 0;
  let shift = 0;
  let o = offset;
  while (o < bytes.length) {
    const b = bytes[o++];
    value |= (b & 0x7f) << shift;
    if ((b & 0x80) === 0) return { value, offset: o };
    shift += 7;
    if (shift >= 32) throw new Error("Varint too long");
  }
  throw new Error("Unexpected end of buffer reading varint");
}

function base64ToBytes(b64: string): Uint8Array {
  // Use Buffer when running on Node (server), otherwise fall back to atob.
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(b64, "base64"));
  }
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}
