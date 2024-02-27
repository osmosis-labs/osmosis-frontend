import { observer } from "mobx-react-lite";
import React from "react";
import { createGlobalState } from "react-use";

import { IntroducingOneClick } from "~/components/one-click-trading/introducing-one-click";
import { useOneClickTradingParams } from "~/hooks";
import { useCreateOneClickTradingSession } from "~/hooks/one-click-trading/use-create-one-click-trading-session";
import { ModalBase } from "~/modals/base";
import { useStore } from "~/stores";

type Props = {};

export const useGlobalIs1CTIntroModalOpen = createGlobalState(false);

const OneClickTradingIntroModal = observer((props: Props) => {
  const { accountStore, chainStore } = useStore();
  const [isOpen, setIsOpen] = useGlobalIs1CTIntroModalOpen();

  const {
    transaction1CTParams,
    setTransaction1CTParams,
    isLoading: isLoading1CTParams,
    spendLimitTokenDecimals,
    reset: reset1CTParams,
  } = useOneClickTradingParams();

  const create1CTSessionMutation = useCreateOneClickTradingSession({
    addAuthenticatorsQueryOptions: {
      onSuccess: () => {
        setIsOpen(false);
      },
    },
  });

  return (
    <ModalBase isOpen={isOpen} onRequestClose={() => setIsOpen(false)}>
      <div className="mx-auto flex max-w-lg items-center">
        <IntroducingOneClick
          isLoading={isLoading1CTParams || create1CTSessionMutation.isLoading}
          onStartTrading={() => {
            create1CTSessionMutation.onCreate1CTSession({
              spendLimitTokenDecimals,
              transaction1CTParams,
              walletRepo: accountStore.getWalletRepo(
                chainStore.osmosis.chainId
              ),
            });
          }}
        />
      </div>
    </ModalBase>
  );
});

export default OneClickTradingIntroModal;
