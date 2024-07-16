import { cosmwasm, ibc } from "@osmosis-labs/proto-codecs";

interface AccountMsgOpt {
  shareCoinDecimals?: number;
  /**
   * In cases where fee estimation isn't supported, gas can be included as a fallback option.
   * This proves particularly beneficial for accounts like CosmosAccount that depend on external chains.
   */
  gas?: number;
  messageComposer?: any;
}

export const createMsgOpts = <
  Dict extends Record<
    string,
    AccountMsgOpt | ((param: number) => AccountMsgOpt)
  >
>(
  dict: Dict
) => dict;

/** Core message options for cosmos-based chains. */
export const cosmosMsgOpts = createMsgOpts({
  ibcTransfer: {
    gas: 450000,
    messageComposer:
      ibc.applications.transfer.v1.MessageComposer.withTypeUrl.transfer,
  },
});

export const cosmwasmMsgOpts = createMsgOpts({
  executeWasm: {
    gas: 0,
    messageComposer:
      cosmwasm.wasm.v1.MessageComposer.withTypeUrl.executeContract,
  },
});
