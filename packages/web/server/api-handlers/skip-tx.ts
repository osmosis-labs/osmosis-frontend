import { createSkipTxHandler } from "~/server/integrations/skip/tx-status-handler";

export const skipTrackTxHandler = createSkipTxHandler(
  (client, params) => client.trackTransaction(params),
  "POST"
);

export const skipTxStatusHandler = createSkipTxHandler(
  (client, params) => client.transactionStatus(params),
  "GET"
);
