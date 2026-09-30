import { createSkipTxHandler } from "~/server/integrations/skip/tx-status-handler";

export default createSkipTxHandler((client, params) =>
  client.trackTransaction(params)
);
