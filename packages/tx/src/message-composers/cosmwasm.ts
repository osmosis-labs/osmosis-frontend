import type { Coin } from "@osmosis-labs/proto-codecs/build/codegen/cosmos/base/v1beta1/coin";

import { getCosmwasmCodec } from "../codec";

export async function makeExecuteCosmwasmContractMsg<
  Obj extends Record<any, any>
>({
  sender,
  contract,
  msg,
  funds,
}: {
  sender: string;
  contract: string;
  msg: Obj;
  funds: Coin[];
}) {
  const cosmwasm = await getCosmwasmCodec();
  return cosmwasm.wasm.v1.MessageComposer.withTypeUrl.executeContract({
    sender,
    contract,
    msg: Buffer.from(JSON.stringify(msg)),
    funds,
  });
}

makeExecuteCosmwasmContractMsg.gas = 0;
