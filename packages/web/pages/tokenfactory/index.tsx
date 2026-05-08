import { observer } from "mobx-react-lite";
import type { NextPage } from "next";
import { NextSeo } from "next-seo";
import { useCallback, useState } from "react";

import { CreateTokenConfig } from "~/components/complex/token/create";
import { TokenCard } from "~/components/complex/token/manage/token-card";
import { Button } from "~/components/ui/button";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { CreateTokenModal } from "~/modals";
import { useStore } from "~/stores";

const TokenFactory: NextPage = observer(function () {
  const { accountStore, queriesStore } = useStore();
  const { t } = useTranslation();
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const address = account?.address ?? "";

  const queryDenomsFromCreator = queriesStore
    .get(accountStore.osmosisChainId)
    .osmosis?.queryDenomsFromCreator.get(address);

  const userDenoms = queryDenomsFromCreator?.denoms ?? [];

  useAmplitudeAnalytics({
    onLoadEvent: [EventName.TokenFactory.pageViewed],
  });

  const [isCreating, setIsCreating] = useState(false);
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [txResult, setTxResult] = useState<"success" | string | null>(null);

  const onCreateToken = useCallback(
    async (config: CreateTokenConfig) => {
      setIsSendingMsg(true);
      setTxResult(null);
      try {
        await account?.osmosis.sendCreateTokenFactoryDenomMsg(
          {
            subdenom: config.subdenom,
            name: config.name,
            symbol: config.symbol,
            decimals: config.decimals,
            description: config.description || undefined,
            uri: config.uri || undefined,
            uriHash: config.uriHash || undefined,
            mintAmount: config.mintEnabled ? config.mintAmount : undefined,
            mintToAddress:
              config.mintEnabled && config.mintRecipient
                ? config.mintRecipient
                : undefined,
            newAdmin: config.changeAdminEnabled ? config.newAdmin : undefined,
          },
          undefined,
          (tx) => {
            setIsSendingMsg(false);
            if (!tx.code) {
              setTxResult("success");
            } else {
              setTxResult(t("tokenFactory.create.errors.txFailed"));
            }
          }
        );
      } catch (e) {
        setIsSendingMsg(false);
        setTxResult(t("tokenFactory.create.errors.txFailed"));
        console.error(e);
      }
    },
    [account, t]
  );

  return (
    <main className="m-auto max-w-container px-8 md:px-3">
      <NextSeo
        title={t("seo.tokenFactory.title")}
        description={t("seo.tokenFactory.description")}
      />

      <div className="flex flex-col gap-8 py-10">
        <div className="flex items-center justify-between">
          <p className="body1 text-osmoverse-300">
            {t("tokenFactory.description")}
          </p>
          <Button onClick={() => setIsCreating(true)} disabled={!address}>
            {t("tokenFactory.createButton")}
          </Button>
        </div>

        {address ? (
          <div className="flex flex-col gap-3">
            {userDenoms.length === 0 ? (
              <div className="rounded-3xl bg-osmoverse-900 p-6">
                <p className="body1 text-osmoverse-400">
                  {t("tokenFactory.noTokensYet")}
                </p>
              </div>
            ) : (
              userDenoms.map((denom) => (
                <TokenCard key={denom} denom={denom} walletAddress={address} />
              ))
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-osmoverse-700 p-6 text-center">
            <p className="body1 text-osmoverse-400">
              {t("tokenFactory.connectWallet")}
            </p>
          </div>
        )}
      </div>

      <CreateTokenModal
        isOpen={isCreating}
        onRequestClose={() => {
          setIsCreating(false);
          setTxResult(null);
        }}
        walletAddress={address}
        isSendingMsg={isSendingMsg}
        onCreateToken={onCreateToken}
        txResult={txResult}
        onCreated={() => setTxResult(null)}
      />
    </main>
  );
});

export default TokenFactory;
