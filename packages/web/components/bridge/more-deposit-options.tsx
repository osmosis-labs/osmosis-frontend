import {
  getAxelarExternalUrl,
  getIBCExternalUrl,
  getSkipExternalUrl,
  getSquidExternalUrl,
} from "@osmosis-labs/bridge";
import React from "react";

import { ModalBase, ModalBaseProps } from "~/modals";
import { useStore } from "~/stores";

const externalUrls = [
  {
    title: "Squid",
    logo: "https://osmosis-labs.s3.amazonaws.com/bridge/squid-logo.png",
    getter: getSquidExternalUrl,
  },
  {
    title: "Skip",
    logo: "https://osmosis-labs.s3.amazonaws.com/bridge/skip-logo.png",
    getter: getSkipExternalUrl,
  },
  {
    title: "IBC",
    logo: "https://osmosis-labs.s3.amazonaws.com/bridge/ibc-logo.png",
    getter: getIBCExternalUrl,
  },
  {
    title: "Axelar",
    logo: "https://osmosis-labs.s3.amazonaws.com/bridge/axelar-logo.png",
    getter: getAxelarExternalUrl,
  },
];

export const MoreDepositOptions = (modalProps: ModalBaseProps) => {
  const {
    accountStore,
    chainStore: {
      osmosis: { chainId },
    },
  } = useStore();
  const wallet = accountStore.getWallet(chainId);

  // TODO: Use context state to get the fromAsset, toAsset, fromChain, and toChain
  return (
    <ModalBase title="More deposit options" {...modalProps}>
      {externalUrls.map(({ title, logo, getter }) => {
        const urlPromise = getter({
          fromChain: { chainId: 43114, chainType: "evm" },
          toChain: { chainId: "osmosis-1", chainType: "cosmos" },
          fromAsset: {
            address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
            decimals: 18,
            denom: "USDC",
            sourceDenom: "usdc",
          },
          toAsset: {
            address:
              "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
            decimals: 18,
            denom: "USDC",
            sourceDenom: "usdc",
          },
          env: "mainnet",
          toAddress: wallet?.address ?? "",
        });

        return (
          <a
            key={title}
            href={urlPromise instanceof Promise ? "#" : urlPromise}
            target="_blank"
            rel="noreferrer"
            onClick={async (e) => {
              if (urlPromise instanceof Promise) {
                e.preventDefault();
                const url = await urlPromise;
                if (url) {
                  window.open(url, "_blank", "noopener,noreferrer");
                }
              }
            }}
          >
            {title}
          </a>
        );
      })}
    </ModalBase>
  );
};
