import { Coin } from "@osmosis-labs/proto-codecs/build/codegen/cosmos/base/v1beta1/coin";
import { Height } from "@osmosis-labs/proto-codecs/build/codegen/ibc/core/client/v1/client";

import { getIbcCodec } from "../codec";

export async function makeIBCTransferMsg({
  sourcePort,
  sourceChannel,
  token,
  receiver,
  sender,
  timeoutHeight,
  timeoutTimestamp,
  memo,
}: {
  /** the port on which the packet will be sent */
  sourcePort: string;
  /** the channel by which the packet will be sent */
  sourceChannel: string;
  /** the tokens to be transferred */
  token: Coin;
  /** the sender address */
  sender: string;
  /** the recipient address on the destination chain */
  receiver: string;
  /**
   * Timeout height relative to the current block height.
   * The timeout is disabled when set to 0.
   */
  timeoutHeight: Partial<Height>;
  /**
   * Timeout timestamp in absolute nanoseconds since unix epoch.
   * The timeout is disabled when set to 0.
   */
  timeoutTimestamp: bigint;
  /** optional memo */
  memo: string;
}) {
  const ibcCodec = await getIbcCodec();
  return ibcCodec.applications.transfer.v1.MessageComposer.withTypeUrl.transfer(
    {
      sourcePort,
      sourceChannel,
      token,
      receiver,
      sender,
      // Revision number can be undefined, but our proto makes it required
      // so we need to cast it to Partial<Height> to make it optional
      // @ts-expect-error
      timeoutHeight,
      timeoutTimestamp,
      memo,
    }
  );
}

makeIBCTransferMsg.gas = 250_000;
