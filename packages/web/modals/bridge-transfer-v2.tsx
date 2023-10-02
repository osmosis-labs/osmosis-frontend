import { observer } from "mobx-react-lite";
import { FunctionComponent, useEffect } from "react";
import { useTranslation } from "react-multi-lang";

import { useConnectWalletModalRedirect } from "~/hooks";
import {
  EthClientChainIds_SourceChainMap,
  type SourceChainKey,
} from "~/integrations/bridge-info";
import { ChainNames, EthWallet } from "~/integrations/ethereum";
import type { ObservableWallet } from "~/integrations/wallets";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { IBCBalance } from "~/stores/assets";
import { getKeyByValue } from "~/utils/object";

/** Modal that lets user transfer via non-IBC bridges. */
export const BridgeTransferV2Modal: FunctionComponent<
  ModalBaseProps & {
    isWithdraw: boolean;
    balance: IBCBalance;
    /** Selected network key. */
    sourceChainKey: SourceChainKey;
    walletClient: ObservableWallet;
    onRequestSwitchWallet: () => void;
  }
> = observer((props) => {
  const {
    isWithdraw,
    balance,
    sourceChainKey,
    walletClient,
    onRequestClose,
    onRequestSwitchWallet,
  } = props;
  const t = useTranslation();
  const ethWalletClient = walletClient as EthWallet;
  const { queriesExternalStore, chainStore, accountStore } = useStore();
  const {
    showModalBase,
    accountActionButton: connectWalletButton,
    walletConnected,
  } = useConnectWalletModalRedirect(
    {
      className: "md:w-full w-2/3 md:p-4 p-6 hover:opacity-75 rounded-2xl",
      onClick: () => {},
    },
    props.onRequestClose
  );
  const { chainId, chainName } = chainStore.osmosis;
  const osmosisAccount = accountStore.getWallet(chainId);
  const osmosisAddress = osmosisAccount?.address ?? "";
  const ethAccountAddress = ethWalletClient.accountAddress;

  // notify eth wallet of prev selected preferred chain
  useEffect(() => {
    let ethClientChainName: string | undefined =
      getKeyByValue(EthClientChainIds_SourceChainMap, sourceChainKey) ??
      sourceChainKey;

    let hexChainId: string | undefined = getKeyByValue(
      ChainNames,
      ethClientChainName
    )
      ? ethClientChainName
      : undefined;

    if (!hexChainId) return;

    ethWalletClient.setPreferredSourceChain(hexChainId);
  }, [ethWalletClient, sourceChainKey, walletClient]);

  if (!balance.originBridgeInfo) {
    console.error("BridgeTransferModal given unconfigured IBC balance/asset");
    return null;
  }
  const { bridge } = balance.originBridgeInfo;

  const sourceChainConfig = balance.originBridgeInfo.sourceChainTokens.find(
    ({ id }) => id === sourceChainKey
  );

  let title = "";

  if (isWithdraw) {
    /** Since the modal will display a toggle, hide the coin denom from the title  */
    if (
      bridge === "axelar" &&
      Boolean(sourceChainConfig?.nativeWrapEquivalent)
    ) {
      title = t("assets.transferAssetSelect.withdraw");
    } else {
      title = t("assets.transfer.titleWithdraw", {
        coinDenom: balance.balance.currency.coinDenom,
      });
    }
  } else {
    /** Since the modal will display a toggle, hide the coin denom from the title  */
    if (
      bridge === "axelar" &&
      Boolean(sourceChainConfig?.nativeWrapEquivalent)
    ) {
      title = t("assets.transferAssetSelect.deposit");
    } else {
      title = t("assets.transfer.titleDeposit", {
        coinDenom: balance.balance.currency.coinDenom,
      });
    }
  }

  console.log(balance.balance);

  const bestQuote = queriesExternalStore.queryBridgeBestQuote.getBestQuote({
    fromAddress: ethAccountAddress!, // ethereum account
    fromAmount: "12", // input amount
    fromAsset: {
      denom: balance.balance.denom, //  we already have it
      address: sourceChainConfig?.erc20ContractAddress!, // we already have it
    },
    fromChain: {
      chainId: sourceChainConfig?.chainId!, // TODO: add the chain id
      chainName: sourceChainConfig?.id!, // we already have it
    },
    toAddress: osmosisAddress, // osmo address
    toAsset: {
      denom: balance.balance.currency.coinDenom, // ibc counterpart denom
      address: balance.balance.currency.coinMinimalDenom, // ibc counterpart address
    },
    toChain: {
      chainId, // Will always be osmosis-1 on deposit; TODO: add the chain id of the opposite chain
      chainName, // Will always be Osmosis on deposit; TODO: add the chain name of the opposite chain
    },
  });

  console.log(bestQuote.response);

  return (
    <ModalBase
      {...props}
      title={title}
      isOpen={props.isOpen && showModalBase}
    ></ModalBase>
  );
});
