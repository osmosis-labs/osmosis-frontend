import { toBase64 } from "@cosmjs/encoding";
import { PrivKeySecp256k1 } from "@keplr-wallet/crypto";
import { DeliverTxResponse } from "@osmosis-labs/tx";
import { makeAddAuthenticatorMsg } from "@osmosis-labs/tx";
import {
  AuthenticatorType,
  AvailableOneClickTradingMessages,
  OneClickTradingResetPeriods,
  ParsedAuthenticator,
} from "@osmosis-labs/types";
import { Dec, DecUtils } from "@osmosis-labs/unit";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { SPEND_LIMIT_CONTRACT_ADDRESS } from "~/config";
import { getAuthenticatorIdFromTx } from "~/hooks/mutations/one-click-trading";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export class CreateMobileSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletSelectMobileError";
  }
}

export function isAuthenticatorLegacyMobileSession({
  authenticator,
}: {
  authenticator: ParsedAuthenticator;
}) {
  return (
    authenticator.type === "AllOf" &&
    authenticator.subAuthenticators.some(
      (sub) => sub.type === "SignatureVerification"
    ) &&
    authenticator.subAuthenticators.some(
      (sub) =>
        sub.type === "AnyOf" &&
        sub.subAuthenticators.every((sub) => sub.type === "MessageFilter")
    ) &&
    !authenticator.subAuthenticators.some(
      (sub) => sub.type === "CosmwasmAuthenticatorV1"
    ) // Should not contain a spend limit authenticator. This is the main difference between 1CT and mobile session authenticators.
  );
}

export function isAuthenticatorMobileSession({
  authenticator,
}: {
  authenticator: ParsedAuthenticator;
}) {
  return (
    authenticator.type === "AllOf" &&
    authenticator.subAuthenticators.some(
      (sub) => sub.type === "SignatureVerification"
    ) &&
    authenticator.subAuthenticators.some(
      (sub) =>
        sub.type === "CosmwasmAuthenticatorV1" &&
        sub.contract === SPEND_LIMIT_CONTRACT_ADDRESS &&
        !sub.params.time_limit // time_limit is undefined for mobile sessions
    ) &&
    authenticator.subAuthenticators.some(
      (sub) =>
        sub.type === "AnyOf" &&
        sub.subAuthenticators.every((sub) => sub.type === "MessageFilter")
    )
  );
}

export function getMobileSessionAuthenticator({
  key,
  allowedMessages,
  allowedAmount,
}: {
  key: PrivKeySecp256k1;
  allowedMessages: AvailableOneClickTradingMessages[];
  allowedAmount: string;
}): {
  authenticatorType: AuthenticatorType;
  data: Uint8Array;
} {
  const signatureVerification = {
    type: "SignatureVerification",
    config: toBase64(key.getPubKey().toBytes()),
  };

  const messageFilters = allowedMessages.map((message) => ({
    type: "MessageFilter",
    config: toBase64(Buffer.from(`{"@type":"${message}"}`)),
  }));

  const messageFilterAnyOf = {
    type: "AnyOf",
    config: toBase64(Buffer.from(JSON.stringify(messageFilters))),
  };

  // Create spend limit authenticator
  const spendLimitParams = toBase64(
    Buffer.from(
      JSON.stringify({
        limit: allowedAmount,
        reset_period: "day" as OneClickTradingResetPeriods,
        // time_limit is undefined for mobile sessions
        time_limit: undefined,
      })
    )
  );

  const spendLimit = {
    type: "CosmwasmAuthenticatorV1",
    config: toBase64(
      Buffer.from(
        `{"contract": "${SPEND_LIMIT_CONTRACT_ADDRESS}", "params": "${spendLimitParams}"}`
      )
    ),
  };

  const compositeAuthData = [
    signatureVerification,
    spendLimit,
    messageFilterAnyOf,
  ];

  // We return the message structure we want to broadcase here,
  // not the structure of the authenticator returned from the chain.
  return {
    authenticatorType: "AllOf",
    data: new Uint8Array(
      Buffer.from(JSON.stringify(compositeAuthData)).toJSON().data
    ),
  };
}

export async function makeCreateMobileSessionMessage({
  userOsmoAddress,
  allowedAmount,
}: {
  userOsmoAddress: string;
  allowedAmount: string;
}) {
  const key = PrivKeySecp256k1.generateRandomKey();
  const allowedMessages: AvailableOneClickTradingMessages[] = [
    "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn",
    "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn",
    "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut",
    "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOut",
  ];

  const mobileSessionAuthenticator = getMobileSessionAuthenticator({
    key,
    allowedMessages,
    allowedAmount,
  });

  const addAuthenticatorMsg = makeAddAuthenticatorMsg({
    authenticatorType: mobileSessionAuthenticator.authenticatorType,
    data: mobileSessionAuthenticator.data,
    sender: userOsmoAddress,
  });

  return {
    msgs: [await addAuthenticatorMsg],
    allowedMessages,
    key,
  };
}

export const useCreateMobileSession = ({
  onBroadcasted,
  queryOptions,
}: {
  onBroadcasted?: () => void;
  queryOptions?: UseMutationOptions<
    unknown,
    unknown,
    { allowedAmount: string },
    unknown
  >;
} = {}) => {
  const { accountStore } = useStore();

  const apiUtils = api.useUtils();

  return useMutation(async ({ allowedAmount }) => {
    const wallet = accountStore.getWallet(accountStore.osmosisChainId);
    const userOsmoAddress = wallet?.address;

    if (!userOsmoAddress) {
      throw new CreateMobileSessionError("Osmosis account not found");
    }

    if (!wallet.offlineSigner) {
      await wallet.initOfflineSigner();
    }

    if (!wallet.offlineSigner) {
      throw new Error("offlineSigner is not available in wallet");
    }

    const accountFromSigner = (await wallet.offlineSigner.getAccounts()).find(
      (account) => account.address === userOsmoAddress
    );

    if (!accountFromSigner) {
      throw new Error("Failed to retrieve account from signer");
    }

    const { spendLimitTokenDecimals } =
      await apiUtils.local.oneClickTrading.getParameters.ensureData();

    const { msgs, key, allowedMessages } = await makeCreateMobileSessionMessage(
      {
        userOsmoAddress,
        // Allowed amount is in the spend limit token's decimals
        allowedAmount: new Dec(allowedAmount)
          .mul(DecUtils.getTenExponentN(spendLimitTokenDecimals))
          .truncate()
          .toString(),
      }
    );

    const tx = await new Promise<DeliverTxResponse>((resolve, reject) => {
      accountStore
        .signAndBroadcast(
          accountStore.osmosisChainId,
          "addOrRemoveAuthenticators",
          msgs,
          "",
          undefined,
          undefined,
          {
            onBroadcasted,
            onFulfill: (tx) => {
              if (tx.code === 0) {
                resolve(tx);
              } else {
                reject(new Error("Transaction failed"));
              }
            },
          }
        )
        .catch((error) => {
          reject(error);
        });
    });

    const authenticatorId = await getAuthenticatorIdFromTx({
      events: tx.events,
      userOsmoAddress,
      fallbackGetAuthenticatorId:
        apiUtils.local.oneClickTrading.getSessionAuthenticator.fetch,
      publicKey: toBase64(key.getPubKey().toBytes()),
    });

    return {
      key: toBase64(key.toBytes()),
      accountOwnerPublicKey: accountFromSigner.pubkey,
      publicKey: toBase64(key.getPubKey().toBytes()),
      address: userOsmoAddress,
      authenticatorId,
      allowedMessages,
    };
  }, queryOptions);
};
