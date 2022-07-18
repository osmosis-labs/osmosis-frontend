import { FunctionComponent } from "react";
// import { Transfer } from "../../components/complex/transfer";
import { AxelarBridgeConfig, SourceChain } from ".";
import { EthClient } from "../ethereum";

const AxelarTransfer: FunctionComponent<
  {
    isWithdraw: boolean;
    client: EthClient;
    selectedSourceChainKey: SourceChain;
  } & AxelarBridgeConfig
> = () => <div>axelar transfer!</div>;

export default AxelarTransfer;
