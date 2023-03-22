import { cosmwasm } from "osmojs";

import { createMsgOpts } from "../utils";

export const cosmwasmMsgOpts = createMsgOpts({
  executeWasm: {
    gas: 0,
    messageComposer:
      cosmwasm.wasm.v1.MessageComposer.withTypeUrl.executeContract,
  },
});
