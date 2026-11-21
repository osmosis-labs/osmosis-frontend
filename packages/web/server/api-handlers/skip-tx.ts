import { createSkipTxHandler } from "~/server/integrations/skip/tx-status-handler";

// Accept GET temporarily during the two-step rollout so already-open browser
// tabs keep working until PR 2 restricts this route to POST-only.
export const skipTrackTxHandler = createSkipTxHandler(
  (client, params) => client.trackTransaction(params),
  ["POST", "GET"]
);

export const skipTxStatusHandler = createSkipTxHandler(
  (client, params) => client.transactionStatus(params),
  ["GET"]
);
