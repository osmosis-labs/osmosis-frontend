// import * as LaunchDarkly from "@launchdarkly-node-server-sdk";

// let launchDarklyClient;

// async function initialize() {
//   const client = LaunchDarkly.init(process.env.LAUNCHDARKLY_SDK_KEY);
//   await client.waitForInitialization();
//   return client;
// }

// export async function getClient() {
//   if (launchDarklyClient) return launchDarklyClient;
//   return (launchDarklyClient = await initialize());
// }

import * as LaunchDarkly from "@launchdarkly/node-server-sdk";

let launchDarklyClient: LaunchDarkly.LDClient | undefined;

async function initialize(): Promise<LaunchDarkly.LDClient> {
  const client = LaunchDarkly.init(process.env.LAUNCHDARKLY_SDK_KEY as string);
  await client.waitForInitialization();
  return client;
}

export async function getClient(): Promise<LaunchDarkly.LDClient> {
  if (launchDarklyClient) {
    return launchDarklyClient;
  }
  return (launchDarklyClient = await initialize());
}
