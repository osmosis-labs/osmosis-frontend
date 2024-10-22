import { AvailableFlags } from "@osmosis-labs/types";
import { camelToKebabCase } from "@osmosis-labs/utils";
import * as LaunchDarkly from "launchdarkly-node-client-sdk";

let ldClient: LaunchDarkly.LDClient;

async function getLaunchDarklyClient(): Promise<LaunchDarkly.LDClient> {
  const client = LaunchDarkly.initialize(
    process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID ?? "",
    {
      kind: "user",
      key: "osmosis-frontend-server",
    }
  );
  await client.waitForInitialization();
  return client;
}

export async function getLaunchDarklyFlagValue<ReturnValue = boolean>({
  key,
  defaultValue,
}: {
  key: AvailableFlags;
  defaultValue?: ReturnValue;
}): Promise<ReturnValue> {
  if (!ldClient) ldClient = await getLaunchDarklyClient();
  const flagValue = (await ldClient.variation(
    camelToKebabCase(key),
    defaultValue
  )) as ReturnValue;
  return flagValue;
}
