import { Registry } from "@cosmjs/proto-signing";

let registry: Registry;
export async function getRegistry() {
  if (!registry) {
    const [
      {
        cosmosProtoRegistry,
        cosmwasmProtoRegistry,
        ibcProtoRegistry,
        osmosisProtoRegistry,
      },
      { Registry },
    ] = await Promise.all([
      import("@osmosis-labs/proto-codecs"),
      import("@cosmjs/proto-signing"),
    ]);

    registry = new Registry([
      ...cosmwasmProtoRegistry,
      ...cosmosProtoRegistry,
      ...ibcProtoRegistry,
      ...osmosisProtoRegistry,
    ]);
  }
  return registry;
}
