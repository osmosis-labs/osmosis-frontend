// should be defined somewhere "project" wide
const REST_ENDPOINT = "https://lcd.osmotest5.osmosis.zone";

export async function querySmartContract<T = unknown>(
  address: string,
  query: object
): Promise<T> {
  const encodedQuery = Buffer.from(JSON.stringify(query)).toString("base64");

  const res = await fetch(
    `${REST_ENDPOINT}/cosmwasm/wasm/v1/contract/${address}/smart/${encodedQuery}`,
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
