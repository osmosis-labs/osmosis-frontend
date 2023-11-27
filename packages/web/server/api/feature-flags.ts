import * as ld from "launchdarkly-node-server-sdk";

// we should avoid exposing launchdarkly details to the rest of the app
// instead, we should create a wrapper around the SDK that exposes only simple helper functions

const SDK_KEY = process.env.NEXT_PUBLIC_LAUNCH_DARKLY_SDK_KEY;

if (!SDK_KEY) throw new Error("LaunchDarkly SDK key not found");

// https://docs.launchdarkly.com/sdk/server-side/node-js
// The docs instruct us to maintain a singleton client instance per node process since it has internal long-lived state.
/** Global singleton LaunchDarkly context. */
const ldClient = ld.init(SDK_KEY);

const ldAnonymousContext = {
  key: "SHARED-CONTEXT-KEY",
  anonymous: true,
};

/** Checks a boolean feature flag given a string feature flag identifier. */
export async function checkFeatureFlag(
  featureFlagIdentifier: string
): Promise<boolean> {
  await ldClient.waitForInitialization();
  return await ldClient.variation(
    featureFlagIdentifier,
    ldAnonymousContext,
    false
  );
}
