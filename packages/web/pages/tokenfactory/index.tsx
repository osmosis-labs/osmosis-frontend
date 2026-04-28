import { observer } from "mobx-react-lite";
import type { NextPage } from "next";
import { NextSeo } from "next-seo";
import { useCallback, useState } from "react";

import { CreateTokenConfig } from "~/components/complex/token/create";
import { Button } from "~/components/ui/button";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { CreateTokenModal } from "~/modals";
import { useStore } from "~/stores";

const TokenFactory: NextPage = observer(function () {
  const { accountStore } = useStore();
  const { t } = useTranslation();
  const account = accountStore.getWallet(accountStore.osmosisChainId);

  useAmplitudeAnalytics({
    onLoadEvent: [EventName.TokenFactory.pageViewed],
  });

  const [isCreating, setIsCreating] = useState(false);
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  const onCreateToken = useCallback(
    async (config: CreateTokenConfig) => {
      setIsSendingMsg(true);
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
          () => {
            setIsSendingMsg(false);
            setIsCreating(false);
          }
        );
      } catch (e) {
        setIsSendingMsg(false);
        console.error(e);
      }
    },
    [account]
  );

  return (
    <main className="m-auto max-w-container px-8 md:px-3">
      <NextSeo
        title={t("seo.tokenFactory.title")}
        description={t("seo.tokenFactory.description")}
      />

      <div className="flex flex-col gap-8 py-10">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h4>{t("tokenFactory.title")}</h4>
            <p className="body1 text-osmoverse-300">
              {t("tokenFactory.description")}
            </p>
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            disabled={!account?.address}
          >
            {t("tokenFactory.createButton")}
          </Button>
        </div>

        {/* Token list — shows tokens created by the connected wallet */}
        {/* TODO: wire up queryDenomsFromCreator once added to OsmosisQueries */}
        {account?.address ? (
          <div className="rounded-3xl bg-osmoverse-900 p-6">
            <p className="body1 text-osmoverse-400">
              {t("tokenFactory.noTokensYet")}
            </p>
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
        onRequestClose={() => setIsCreating(false)}
        walletAddress={account?.address ?? ""}
        isSendingMsg={isSendingMsg}
        onCreateToken={onCreateToken}
      />
    </main>
  );
});

export default TokenFactory;
