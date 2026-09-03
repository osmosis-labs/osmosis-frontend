import { TxSnapshot } from "@osmosis-labs/bridge";
import { DeliverTxResponse } from "@osmosis-labs/stores";
import dayjs from "dayjs";
import { useCallback, useRef, useState } from "react";

import { displayToast } from "~/components/alert/toast";
import { ToastType } from "~/components/alert/types";
import { useStore } from "~/stores";
import { getChainBalance, waitForSkipStepArrival } from "~/utils/multi-tx";
import { api, RouterInputs } from "~/utils/trpc";

// re-exported for existing consumers; the implementations live in a
// store-free util module so the transfer-history store can use them too
export { getChainBalance, waitForSkipStepArrival } from "~/utils/multi-tx";

/** Quote parameters needed to rebuild a multi-tx step, minus the step
 *  itself. All of them are also persisted on a transfer's `TxSnapshot`,
 *  so an interrupted transfer can be resumed from history. */
export type MultiTxStepQuoteParams = Omit<
  RouterInputs["bridgeTransfer"]["getTransactionStepByBridge"],
  "bridge" | "step" | "route"
>;

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
              // advanced) history entry, now keyed by the final tx's hash.
              // Uppercased to match the broadcast-time key: the account
              // store reports DeliverTxResponse hashes in lowercase, and
              // the snapshot lookup is strict equality.
              transferHistoryStore.receiveNewTxStatus(
                tx.transactionHash.toUpperCase(),
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
  // Synchronous re-entry guard: the state set above only updates on the
  // next render, so two Continue clicks in the same frame would both pass
  // a state-based check and sign the final step twice.
  const resumingRef = useRef<Set<string>>(new Set());

  const resume = useCallback(
    async (snapshot: TxSnapshot) => {
      const { pendingStep } = snapshot;
      if (
        !pendingStep ||
        // marked stale: the expected funds left the intermediate account,
        // so this step must never be signed again
        pendingStep.stale ||
        resumingRef.current.has(snapshot.sendTxHash)
      )
        return;
      resumingRef.current.add(snapshot.sendTxHash);

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
        // if it happens to hold enough of the denom, spends unrelated
        // funds. Distinct copy from the preflight mismatch: here the funds
        // HAVE already moved and sit on the original account.
        if (
          pendingStep.intermediateAddress &&
          senderAddress !== pendingStep.intermediateAddress
        ) {
          displayToast(
            {
              titleTranslationKey: "transfer.multiTxWrongAccountTitle",
              captionTranslationKey: [
                "transfer.multiTxResumeWrongAccount",
                { chain: pendingStep.prettyName },
              ],
            },
            ToastType.ERROR
          );
          return;
        }

        // The expected funds must still be there ON TOP of whatever the
        // account held before the first transaction: comparing against the
        // total balance alone is not replay-proof (an account that already
        // held enough of the denom would pass after the step was completed
        // from another session, and signing would spend unrelated funds).
        // A definite shortfall means the step was completed elsewhere or
        // the funds were moved, so the entry is resolved rather than left
        // offering a duplicate Continue. An unreadable balance (LCD down)
        // does not block, as the transaction itself still fails without
        // sufficient funds.
        if (pendingStep.expectedArrival) {
          // Fail closed on a missing baseline: without it the check would
          // degrade to the replayable total-balance comparison.
          if (pendingStep.preArrivalBalance === undefined) {
            throw new Error(
              "Missing pre-arrival balance baseline on pending transfer"
            );
          }
          const balance = await getChainBalance({
            chainId: pendingStep.chainId,
            address: senderAddress,
            denom: pendingStep.expectedArrival.denom,
          });
          const required =
            BigInt(pendingStep.expectedArrival.amount) +
            BigInt(pendingStep.preArrivalBalance);
          if (balance !== undefined && balance < required) {
            transferHistoryStore.markPendingStepStale(snapshot.sendTxHash);
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
        resumingRef.current.delete(snapshot.sendTxHash);
        setResumingTxHashes((prev) => {
          const next = new Set(prev);
          next.delete(snapshot.sendTxHash);
          return next;
        });
      }
    },
    [getIntermediateAccount, signFinalStep, transferHistoryStore]
  );

  const isResuming = useCallback(
    (sendTxHash: string) => resumingTxHashes.has(sendTxHash),
    [resumingTxHashes]
  );

  return { resume, isResuming };
};
