import type { BridgeChain } from "@osmosis-labs/bridge";
import { debounce } from "debounce";
import React, { useMemo, useState } from "react";

import { SearchBox } from "~/components/input";
import { useTranslation } from "~/hooks/language";
import { ModalBase, ModalBaseProps } from "~/modals";

interface BridgeNetworkSelectProps extends ModalBaseProps {
  chains: {
    prettyName: string;
    chainId: BridgeChain["chainId"];
    chainType: BridgeChain["chainType"];
  }[];
  onSelectChain: (chain: BridgeChain) => void;
}

export const BridgeNetworkSelect = ({
  chains,
  onSelectChain,
  ...modalProps
}: BridgeNetworkSelectProps) => {
  const { t } = useTranslation();

  const [query, setQuery] = useState("");

  const filteredChains = useMemo(() => {
    return chains.filter(({ prettyName }) =>
      prettyName.toLowerCase().includes(query.toLowerCase())
    );
  }, [chains, query]);

  return (
    <ModalBase
      title={t("transfer.bridgeNetworkSelect.title")}
      className="!max-w-[30rem]"
      {...modalProps}
      onAfterClose={() => {
        setQuery("");
      }}
    >
      <SearchBox
        onInput={debounce((nextValue) => {
          setQuery(nextValue);
        }, 300)}
        className="my-4 flex-shrink-0"
        placeholder={t("transfer.bridgeNetworkSelect.searchPlaceholder")}
        size="full"
      />
      <div className="flex flex-col gap-1">
        {filteredChains.map((chain) => (
          <button
            key={chain.chainId}
            className="subtitle1 flex items-center justify-between rounded-2xl px-4 py-4 transition-colors duration-200 hover:bg-osmoverse-700/50"
            onClick={() =>
              onSelectChain({
                chainId: chain.chainId,
                chainType: chain.chainType,
                chainName: chain.prettyName,
              } as BridgeChain)
            }
          >
            {chain.prettyName}
          </button>
        ))}
      </div>
    </ModalBase>
  );
};
