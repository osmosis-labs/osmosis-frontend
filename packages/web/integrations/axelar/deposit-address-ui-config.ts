import { action, flow, makeAutoObservable, reaction } from "mobx";
import { AxelarAssetTransfer } from "your_axelar_module_path_here";

class DepositAddressStore {
  environment = null;
  sourceChain = "";
  destChain = "";
  destinationAddress = "";
  coinMinimalDenom = "";
  autoUnwrapIntoNative = false;

  depositAddress = null;
  error = null;
  isLoading = false;

  constructor(environment) {
    this.environment = environment;

    makeAutoObservable(this, {
      getDepositAddress: action,
      updateDepositAddress: flow,
    });

    reaction(
      () => ({
        sourceChain: this.sourceChain,
        destChain: this.destChain,
        destinationAddress: this.destinationAddress,
        coinMinimalDenom: this.coinMinimalDenom,
        autoUnwrapIntoNative: this.autoUnwrapIntoNative,
      }),
      (params) => {
        this.updateDepositAddress(params);
      }
    );
  }

  getDepositAddress(params) {
    const {
      sourceChain,
      destChain,
      destinationAddress,
      coinMinimalDenom,
      autoUnwrapIntoNative,
    } = params;

    this.sourceChain = sourceChain;
    this.destChain = destChain;
    this.destinationAddress = destinationAddress;
    this.coinMinimalDenom = coinMinimalDenom;
    this.autoUnwrapIntoNative = autoUnwrapIntoNative;
  }

  *updateDepositAddress(params) {
    this.isLoading = true;
    this.error = null;

    try {
      const {
        sourceChain,
        destChain,
        destinationAddress,
        coinMinimalDenom,
        autoUnwrapIntoNative,
      } = params;

      const transfer = new AxelarAssetTransfer({
        environment: this.environment,
      });
      const address = yield transfer.getDepositAddress({
        fromChain: sourceChain,
        toChain: destChain,
        destinationAddress: destinationAddress,
        asset: coinMinimalDenom,
        options: autoUnwrapIntoNative
          ? {
              shouldUnwrapIntoNative: autoUnwrapIntoNative,
            }
          : undefined,
      });

      this.depositAddress = address;
    } catch (error) {
      this.error = error;
    } finally {
      this.isLoading = false;
    }
  }
}

export default DepositAddressStore;
