import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React from "react";
import { createGlobalState } from "react-use";

import { IntroducingOneClick } from "~/components/one-click-trading/introducing-one-click";
import OneClickTradingSettings from "~/components/one-click-trading/one-click-trading-settings";
import { useOneClickTradingParams } from "~/hooks";
import { useCreateOneClickTradingSession } from "~/hooks/one-click-trading/use-create-one-click-trading-session";
import { ModalBase } from "~/modals/base";
import { useStore } from "~/stores";

export const useGlobalIs1CTIntroModalOpen = createGlobalState(false);

const OneClickTradingIntroModal = observer(() => {
  const { accountStore, chainStore } = useStore();
  const [isOpen, setIsOpen] = useGlobalIs1CTIntroModalOpen();
  const create1CTSessionMutation = useCreateOneClickTradingSession({
    addAuthenticatorsQueryOptions: {
      onSuccess: () => {
        setIsOpen(false);
      },
    },
  });

  const [show1CTEditParams, setShow1CTEditParams] = React.useState(false);
  const {
    transaction1CTParams,
    setTransaction1CTParams,
    isLoading: isLoading1CTParams,
    spendLimitTokenDecimals,
    reset: reset1CTParams,
  } = useOneClickTradingParams();

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={() => setIsOpen(false)}
      className={classNames(show1CTEditParams && "px-0 py-9")}
    >
      <div
        className={classNames(
          "flex items-center",
          show1CTEditParams ? "px-8" : "mx-auto max-w-[31rem]"
        )}
      >
        {show1CTEditParams ? (
          <OneClickTradingSettings
            onClose={() => {
              setShow1CTEditParams(false);
            }}
            setTransaction1CTParams={setTransaction1CTParams}
            transaction1CTParams={transaction1CTParams!}
            isLoading={create1CTSessionMutation.isLoading}
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
        ) : (
          <IntroducingOneClick
            isLoading={isLoading1CTParams || create1CTSessionMutation.isLoading}
            onStartTrading={() => {
              reset1CTParams();
              create1CTSessionMutation.onCreate1CTSession({
                spendLimitTokenDecimals,
                transaction1CTParams,
                walletRepo: accountStore.getWalletRepo(
                  chainStore.osmosis.chainId
                ),
              });
            }}
            onClickEditParams={() => {
              setShow1CTEditParams(true);
            }}
          />
        )}
      </div>
    </ModalBase>
  );
});

export default OneClickTradingIntroModal;
