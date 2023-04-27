import { ibc } from "@osmosis-labs/proto-encoder";

import { createMsgOpts } from "../utils";

export const cosmosMsgOpts = createMsgOpts({
  ibcTransfer: {
    gas: 450000,
    messageComposer:
      ibc.applications.transfer.v1.MessageComposer.withTypeUrl.transfer,
  },
});
