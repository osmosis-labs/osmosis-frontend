import { getRequestScoped } from "@osmosis-labs/server";
import { AvailableFlags } from "@osmosis-labs/types";
import { camelToKebabCase } from "@osmosis-labs/utils";
import * as LaunchDarkly from "launchdarkly-node-client-sdk";

const INITIALIZATION_TIMEOUT_SECONDS = 5;

/** The initialized client, shared once ready. While it initializes, the pending
 *  promise is shared only within a request on Workers (see `request-scope.ts` in
 *  @osmosis-labs/server): it can't settle in another request. */
let readyClient: LaunchDarkly.LDClient | undefined;
type ClientInit = { pending?: Promise<LaunchDarkly.LDClient> };
const sharedClientInit: ClientInit = {};
const clientInitSlot = {};

/**
 * Resolves even if LaunchDarkly is unreachable or misconfigured: a timed-out client
 * keeps connecting in the background, and a failed one serves each flag's default.
 */
function getLaunchDarklyClient(): Promise<LaunchDarkly.LDClient> {
  if (readyClient) return Promise.resolve(readyClient);
  const init =
    getRequestScoped<ClientInit>(clientInitSlot, () => ({})) ??
    sharedClientInit;
  init.pending ??= (async () => {
    const client = LaunchDarkly.initialize(
      process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID ?? "",
      {
        kind: "user",
        key: `osmosis-frontend-server`,
      },
      {
        streaming: true,
      }
    );
    try {
      await client.waitForInitialization(INITIALIZATION_TIMEOUT_SECONDS);
    } catch (e) {
      console.warn("LaunchDarkly failed to initialize, using flag defaults", e);
    }
    readyClient = client;
    return client;
  })();
  return init.pending;
}

export async function getLaunchDarklyFlagValue<ReturnValue = boolean>({
  key,
  defaultValue,
}: {
  key: AvailableFlags;
  /** Returned whenever LaunchDarkly is unavailable or the flag can't be evaluated. */
  defaultValue: ReturnValue;
}): Promise<ReturnValue> {
  try {
    const client = await getLaunchDarklyClient();
    return (await client.variation(
      camelToKebabCase(key),
      defaultValue
    )) as ReturnValue;
  } catch (e) {
    console.warn(`LaunchDarkly flag "${key}" evaluation failed`, e);
    return defaultValue;
  }
}
