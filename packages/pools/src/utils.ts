export async function querySmartContract<T = unknown>(
  baseUrl: string,
  address: string,
  query: object
): Promise<T> {
  const encodedQuery = Buffer.from(JSON.stringify(query)).toString("base64");

  const res = await fetch(
    `${baseUrl}/cosmwasm/wasm/v1/contract/${address}/smart/${encodedQuery}`,
    {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`failed to query smart contract: ${address}`);
  }

  const json = await res.json();

  return json.data;
}
