import { TxSnapshot } from "@osmosis-labs/bridge";
import { DeliverTxResponse } from "@osmosis-labs/stores";
import dayjs from "dayjs";
import { useCallback, useState } from "react";

import { displayToast } from "~/components/alert/toast";
import { ToastType } from "~/components/alert/types";
import { IS_TESTNET } from "~/config";
import { ChainList } from "~/config/generated/chain-list";
import { useStore } from "~/stores";
import { api, RouterInputs } from "~/utils/trpc";

/** Quote parameters needed to rebuild a multi-tx step, minus the step
 *  itself. All of them are also persisted on a transfer's `TxSnapshot`,
 *  so an interrupted transfer can be resumed from history. */
export type MultiTxStepQuoteParams = Omit<
  RouterInputs["bridgeTransfer"]["getTransactionStepByBridge"],
  "bridge" | "step" | "route"
>;

/**
 * Polls Skip until the given tx's own route (the first leg of a multi-tx
 * transfer) completes, i.e. the funds have reached the intermediate chain.
 * `isActive` aborts the loop (e.g. on unmount); `maxAttempts` caps it for
 * one-shot resume checks.
 */
export async function waitForSkipStepArrival({
  chainId,
  txHash,
  isActive = () => true,
  maxAttempts,
  intervalMs = 10_000,
}: {
  chainId: string;
  txHash: string;
  isActive?: () => boolean;
  maxAttempts?: number;
  intervalMs?: number;
}): Promise<"success" | "failed" | "pending" | "aborted"> {
  const env = IS_TESTNET ? "testnet" : "mainnet";
  // prompt Skip to index the tx; the polling below tolerates failures
  await fetch(
    `/api/skip-track-tx?chainID=${chainId}&txHash=${txHash}&env=${env}`
  ).catch(() => undefined);

  for (let attempt = 0; !maxAttempts || attempt < maxAttempts; attempt++) {
    if (!isActive()) return "aborted";
    try {
      const response = await fetch(
        `/api/skip-tx-status?chainID=${chainId}&txHash=${txHash}&env=${env}`
      );
      if (response.ok) {
        const { state } = (await response.json()) as { state?: string };
        if (state === "STATE_COMPLETED_SUCCESS") return "success";
        if (state === "STATE_COMPLETED_ERROR" || state === "STATE_ABANDONED")
          return "failed";
      }
    } catch {
      // transient errors: keep polling
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return "pending";
}

/**
 * Balance of `denom` held by `address` on a cosmos chain, queried via the
 * chain's registry LCD. Returns undefined when it can't be determined, so
 * callers can choose to fail open or closed.
 */
export async function getChainBalance({
  chainId,
  address,
  denom,
}: {
  chainId: string;
  address: string;
  denom: string;
}): Promise<bigint | undefined> {
  const chain = ChainList.find((c) => c.chain_id === chainId);
  const rest = chain?.apis?.rest?.[0]?.address;
  if (!rest) return undefined;
  try {
    const response = await fetch(
      `${rest.replace(
        /\/$/,
        ""
      )}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${encodeURIComponent(
        denom
      )}`
    );
    if (!response.ok) return undefined;
    const { balance } = (await response.json()) as {
      balance?: { amount?: string };
    };
    return BigInt(balance?.amount ?? "0");
  } catch {
    return undefined;
  }
}

/**
 * Shared machinery for the final user-signed step of a multi-tx bridge
 * route: connecting the wallet on the intermediate chain, and rebuilding +
 * signing the step. Used by the live transfer flow (`useBridgeQuotes`) and
 * the resume-from-history flow (`useMultiTxResume`).
 */
export const useMultiTxFinalStep = () => {
  const { accountStore, transferHistoryStore } = useStore();
  const apiUtils = api.useUtils();

  /** Connects the wallet on the intermediate chain (chain-suggest if
   *  needed) and returns the wallet's own account address there. */
  const getIntermediateAccount = useCallback(
    async (stepChainId: string): Promise<string | undefined> => {
      let wallet = accountStore.getWallet(stepChainId);
      if (!wallet?.address) {
        const osmosisWalletName = accountStore.getWallet(
          accountStore.osmosisChainId
        )?.walletName;
        await accountStore
          .getWalletRepo(stepChainId)
          ?.connect(osmosisWalletName);
        wallet = accountStore.getWallet(stepChainId);
      }
      return wallet?.address;
    },
    [accountStore]
  );

  /**
   * Rebuilds the final step for the originally quoted route (wallet-owned
   * sender, fresh timeout and gas) and signs it on the intermediate chain.
   * On fulfillment, finalizes the transfer's history entry and hands status
   * tracking to the provider.
   */
  const signFinalStep = useCallback(
    async ({
      bridge,
      quoteParams,
      stepChainId,
      senderAddress,
      routeData,
      priorStepTxHash,
      onBroadcasted,
      onBroadcastFailed,
      onFulfilled,
    }: {
      bridge: string;
      quoteParams: MultiTxStepQuoteParams;
      stepChainId: string;
      senderAddress: string;
      routeData: unknown;
      priorStepTxHash: string;
      onBroadcasted?: () => void;
      onBroadcastFailed?: () => void;
      onFulfilled?: () => void;
    }) => {
      const { transactionStep } =
        await apiUtils.bridgeTransfer.getTransactionStepByBridge.fetch({
          ...quoteParams,
          bridge,
          route: routeData,
          step: { chainId: stepChainId, senderAddress },
        });

      const gasFee = transactionStep.gasFee;
      return accountStore.signAndBroadcast(
        stepChainId,
        `${stepChainId}:${quoteParams.fromAsset.denom} -> ${quoteParams.toChain.chainId}:${quoteParams.toAsset.denom}`,
        transactionStep.msgs,
        "",
        gasFee
          ? {
              gas: gasFee.gas,
              amount: [
                {
                  denom: gasFee.denom,
                  amount: gasFee.amount,
                },
              ],
            }
          : undefined,
        {
          preferNoSetFee: Boolean(gasFee),
        },
        {
          onBroadcastFailed,
          // Advance the history entry the moment the final tx broadcasts:
          // waiting for fulfillment leaves a window where closing the app
          // forgets this step was ever sent, and Continue could then sign
          // and send it a second time.
          onBroadcasted: (txHash: Uint8Array) => {
            transferHistoryStore.advanceMultiTxStep(priorStepTxHash, {
              finalSendTxHash: Buffer.from(txHash)
                .toString("hex")
                .toUpperCase(),
              trackingChainId: stepChainId,
              estimatedArrivalUnix: dayjs().unix() + 60,
            });
            onBroadcasted?.();
          },
          onFulfill: (tx: DeliverTxResponse) => {
            if (tx.code == null || tx.code === 0) {
              onFulfilled?.();
            } else {
              // included on-chain but failed: reflect it on the (already
              // advanced) history entry, now keyed by the final tx's hash
              transferHistoryStore.receiveNewTxStatus(
                tx.transactionHash,
                "failed",
                undefined
              );
              onBroadcastFailed?.();
            }
          },
        }
      );
    },
    [accountStore, apiUtils, transferHistoryStore]
  );

  return { getIntermediateAccount, signFinalStep };
};

/**
 * Resumes an interrupted multi-tx transfer from its persisted history
 * entry: re-checks that the first step's funds arrived on the intermediate
 * chain, connects the wallet there, and signs the final step.
 */
export const useMultiTxResume = () => {
  const { transferHistoryStore } = useStore();
  const { getIntermediateAccount, signFinalStep } = useMultiTxFinalStep();
  const [resumingTxHashes, setResumingTxHashes] = useState<ReadonlySet<string>>(
    new Set()
  );

  const resume = useCallback(
    async (snapshot: TxSnapshot) => {
      const { pendingStep } = snapshot;
      if (!pendingStep || resumingTxHashes.has(snapshot.sendTxHash)) return;

      setResumingTxHashes((prev) => new Set(prev).add(snapshot.sendTxHash));
      try {
        if (!pendingStep.routeData) {
          // entry predates route persistence; can't rebuild safely
          throw new Error("Missing route data on pending transfer");
        }

        const arrival = await waitForSkipStepArrival({
          chainId: String(snapshot.fromChain.chainId),
          txHash: pendingStep.priorStepTxHash,
          // one-shot-ish check: don't poll forever from a history row
          maxAttempts: 6,
          intervalMs: 5_000,
        });
        if (arrival === "failed") {
          transferHistoryStore.receiveNewTxStatus(
            snapshot.sendTxHash,
            "failed",
            undefined
          );
          return;
        }
        if (arrival !== "success") {
          displayToast(
            {
              titleTranslationKey: "transfer.multiTxStillInTransit",
              captionTranslationKey: [
                "transfer.multiTxWaitingForFunds",
                { chain: pendingStep.prettyName },
              ],
            },
            ToastType.LOADING,
            { autoClose: 5_000 }
          );
          return;
        }

        const senderAddress = await getIntermediateAccount(pendingStep.chainId);
        if (!senderAddress) {
          throw new Error(
            "No wallet account available on " + pendingStep.chainId
          );
        }

        // The step must be signed from the account the first transaction
        // routed funds to. A different connected account either fails or,
        // if it happens to hold enough of the denom, spends unrelated funds.
        if (
          pendingStep.intermediateAddress &&
          senderAddress !== pendingStep.intermediateAddress
        ) {
          displayToast(
            {
              titleTranslationKey: "transfer.multiTxWrongAccountTitle",
              captionTranslationKey: [
                "transfer.multiTxWrongAccount",
                { chain: pendingStep.prettyName },
              ],
            },
            ToastType.ERROR
          );
          return;
        }

        // The expected funds must still be there: a transfer already
        // completed from another session (or moved funds) must not be
        // signed again against whatever else the account holds. A definite
        // shortfall blocks; an unreadable balance (LCD down) does not, as
        // the transaction itself still fails without sufficient funds.
        if (pendingStep.expectedArrival) {
          const balance = await getChainBalance({
            chainId: pendingStep.chainId,
            address: senderAddress,
            denom: pendingStep.expectedArrival.denom,
          });
          if (
            balance !== undefined &&
            balance < BigInt(pendingStep.expectedArrival.amount)
          ) {
            displayToast(
              {
                titleTranslationKey: "transfer.multiTxFundsMissingTitle",
                captionTranslationKey: [
                  "transfer.multiTxFundsMissing",
                  { chain: pendingStep.prettyName },
                ],
              },
              ToastType.ERROR
            );
            return;
          }
        }

        await signFinalStep({
          bridge: snapshot.provider,
          quoteParams: {
            fromAmount: snapshot.fromAsset.amount,
            fromAsset: {
              denom: snapshot.fromAsset.denom,
              address: snapshot.fromAsset.address,
              decimals: snapshot.fromAsset.decimals,
              coinGeckoId: snapshot.fromAsset.coinGeckoId,
            },
            toAsset: {
              denom: snapshot.toAsset.denom,
              address: snapshot.toAsset.address,
              decimals: snapshot.toAsset.decimals,
              coinGeckoId: snapshot.toAsset.coinGeckoId,
            },
            fromChain: snapshot.fromChain,
            toChain: snapshot.toChain,
            fromAddress: snapshot.fromAddress,
            toAddress: snapshot.toAddress,
          },
          stepChainId: pendingStep.chainId,
          senderAddress,
          routeData: pendingStep.routeData,
          priorStepTxHash: pendingStep.priorStepTxHash,
        });
      } catch (e) {
        console.error("Failed to resume multi-tx transfer", e);
        displayToast(
          {
            titleTranslationKey: "transfer.somethingIsntWorking",
            captionTranslationKey: "transfer.sorryForTheInconvenience",
          },
          ToastType.ERROR
        );
      } finally {
        setResumingTxHashes((prev) => {
          const next = new Set(prev);
          next.delete(snapshot.sendTxHash);
          return next;
        });
      }
    },
    [
      getIntermediateAccount,
      resumingTxHashes,
      signFinalStep,
      transferHistoryStore,
    ]
  );

  const isResuming = useCallback(
    (sendTxHash: string) => resumingTxHashes.has(sendTxHash),
    [resumingTxHashes]
  );

  return { resume, isResuming };
};
