export async function queryNode(baseUrl: string, endpoint: string) {
  const response = await fetch(`${baseUrl}${endpoint}`);
  if (!response.ok) throw new Error(`Query failed: ${baseUrl}${endpoint}`);
  const json = await response.json();
  // Cosmos chains return a code if there's an error
  if ("code" in json && Boolean(json.code))
    throw new Error(`JSON deserialization failed ${json.code}`);
  return json;
}
