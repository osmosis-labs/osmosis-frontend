import * as LaunchDarkly from "@launchdarkly/node-server-sdk";

let launchDarklyClient: LaunchDarkly.LDClient | undefined;

async function initialize(): Promise<LaunchDarkly.LDClient> {

  const LAUNCH_DARKLY_SDK_KEY = process.env.LAUNCH_DARKLY_SDK_KEY as string;

  console.log("LAUNCH_DARKLY_SDK_KEY in init: ", LAUNCH_DARKLY_SDK_KEY);

  const client = LaunchDarkly.init(LAUNCH_DARKLY_SDK_KEY);
  console.log("client: ", client)
  await client.waitForInitialization();
  return client;
}

export async function getClient(): Promise<LaunchDarkly.LDClient> {
  if (launchDarklyClient) {
    return launchDarklyClient;
  }
  return (launchDarklyClient = await initialize());
}
