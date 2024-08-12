import { cosmwasm } from "@osmosis-labs/proto-codecs";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";

export function makeExecuteCosmwasmContractMsg<Obj extends Record<any, any>>({
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
  return cosmwasm.wasm.v1.MessageComposer.withTypeUrl.executeContract({
    sender,
    contract,
    msg: Buffer.from(JSON.stringify(msg)),
    funds,
  });
}

makeExecuteCosmwasmContractMsg.gas = 0;
