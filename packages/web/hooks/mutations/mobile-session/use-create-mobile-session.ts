import { toBase64 } from "@cosmjs/encoding";
import { PrivKeySecp256k1 } from "@keplr-wallet/crypto";
import { DeliverTxResponse } from "@osmosis-labs/tx";
import {
  makeAddAuthenticatorMsg,
  makeRemoveAuthenticatorMsg,
} from "@osmosis-labs/tx";
import {
  AuthenticatorType,
  AvailableOneClickTradingMessages,
  ParsedAuthenticator,
} from "@osmosis-labs/types";
import { Dec } from "@osmosis-labs/unit";
import { isNil } from "@osmosis-labs/utils";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { getAuthenticatorIdFromTx } from "~/hooks/mutations/one-click-trading";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export class CreateMobileSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletSelectMobileError";
  }
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
        sub.type === "AnyOf" &&
        sub.subAuthenticators.every((sub) => sub.type === "MessageFilter")
    )
  );
}

export function getMobileSessionAuthenticator({
  key,
  allowedMessages,
}: {
  key: PrivKeySecp256k1;
  allowedMessages: AvailableOneClickTradingMessages[];
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

  const compositeAuthData = [signatureVerification, messageFilterAnyOf];

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
  apiUtils,
}: {
  userOsmoAddress: string;
  apiUtils: ReturnType<typeof api.useUtils>;
}) {
  let authenticators: ParsedAuthenticator[];
  try {
    ({ authenticators } =
      await apiUtils.local.oneClickTrading.getAuthenticators.fetch({
        userOsmoAddress,
      }));
  } catch (error) {
    throw new CreateMobileSessionError(
      "Failed to fetch account public key and authenticators."
    );
  }

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
  });

  const authenticatorToRemoveId =
    authenticators.length === 15
      ? authenticators
          .filter((authenticator) =>
            isAuthenticatorMobileSession({ authenticator })
          )
          .reduce((min, authenticator) => {
            if (isNil(min)) return authenticator.id;
            return new Dec(authenticator.id).lt(new Dec(min))
              ? authenticator.id
              : min;
          }, null as string | null)
      : undefined;

  const authenticatorsToRemove = authenticatorToRemoveId
    ? [BigInt(authenticatorToRemoveId)]
    : [];

  const addAuthenticatorMsg = makeAddAuthenticatorMsg({
    authenticatorType: mobileSessionAuthenticator.authenticatorType,
    data: mobileSessionAuthenticator.data,
    sender: userOsmoAddress,
  });

  const removeAuthenticatorMsgs = authenticatorsToRemove.map((id) =>
    makeRemoveAuthenticatorMsg({
      id,
      sender: userOsmoAddress,
    })
  );

  return {
    msgs: await Promise.all([...removeAuthenticatorMsgs, addAuthenticatorMsg]),
    allowedMessages,
    key,
  };
}

export const useCreateMobileSession = ({
  onBroadcasted,
  queryOptions,
}: {
  onBroadcasted?: () => void;
  queryOptions?: UseMutationOptions<unknown, unknown, void, unknown>;
} = {}) => {
  const { accountStore } = useStore();

  const apiUtils = api.useUtils();

  return useMutation(async () => {
    const wallet = accountStore.getWallet(accountStore.osmosisChainId);
    const userOsmoAddress = wallet?.address;

    if (!userOsmoAddress) {
      throw new CreateMobileSessionError("Osmosis account not found");
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

    const { msgs, key, allowedMessages } = await makeCreateMobileSessionMessage(
      {
        userOsmoAddress,
        apiUtils,
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
      address: userOsmoAddress,
      authenticatorId,
      allowedMessages,
    };
  }, queryOptions);
};
