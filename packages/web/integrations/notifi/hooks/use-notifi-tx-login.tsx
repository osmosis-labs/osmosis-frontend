import { useNotifiClientContext } from "@notifi-network/notifi-react-card";
import { useEffect } from "react";

import { useStore } from "~/stores";

export const useNotifiTxLogin = () => {
  const {
    chainStore: {
      osmosis: { chainId },
    },
    accountStore,
    ephemeralKVStore,
  } = useStore();
  const { client } = useNotifiClientContext();

  useEffect(() => {
    const wallet = accountStore.getWallet(chainId);
    if (!wallet?.address || client?.isAuthenticated) return;

    console.log("DEBUG -- useNotifiTxLogin useEffect", wallet, client);

    let deferredClearInterval = () => {};
    if (client && !client.isAuthenticated) {
      const existingLoginStart = ephemeralKVStore.get("notifi-tx-login");
      if (
        existingLoginStart &&
        Date.now() - existingLoginStart.timestamp > 1000 * 60 * 5
      ) {
        // Before refreshing the login nonce, we need to check if the previous nonce is expired or in process
        const lastExecutedTx = ephemeralKVStore.get("notifi-last-executed-tx");
        if (lastExecutedTx) {
          const memo = lastExecutedTx.memo as string;
          if (memo.includes(existingLoginStart.nonce)) {
            client
              .completeLoginViaTransaction({
                transactionSignature: lastExecutedTx.signature,
              })
              .then((result) => {
                console.log(
                  `DEBUG -- useNotifiTxLogin (completeLoginViaTransaction success)`,
                  result
                );
              })
              .catch((error) => {
                console.log(
                  "DEBUG -- useNotifiTxLogin (completeLoginViaTransaction error)",
                  error
                );
              });
            return;
          }
        }
      } else {
        if (existingLoginStart) {
          return;
        }
      }

      client
        .beginLoginViaTransaction()
        .then((result) => {
          if (result) {
            console.log(
              "DEBUG -- useNotifiTxLogin (beginLoginViaTransaction)",
              result
            );
            ephemeralKVStore.set("notifi-tx-login", {
              nonce: result.logValue,
              timestamp: Date.now(),
            });
          }
        })
        .catch((error) => {
          console.log(
            "DEBUG -- useNotifiTxLogin (beginLoginViaTransaction error)",
            error
          );
        });

      const interval = setInterval(() => {
        const wallet = accountStore.getWallet(chainId);
        if (!wallet?.address || client?.isAuthenticated) return;

        console.log(
          "DEBUG -- useNotifiTxLogin (timer) useNotifiTxLogin",
          wallet,
          client
        );
      }, Math.floor(Math.random() * 800000) + 600000); // a random interval between 8 and 10 minutes to avoid spamming the server

      deferredClearInterval = () => clearInterval(interval);
    }

    return deferredClearInterval;
  }, [accountStore, chainId, client, client.isAuthenticated, ephemeralKVStore]);

  // useEffect is expected to be executed when a tx has completed and there's a new
  // entry in ephemeralKVStore.get("notifi-last-executed-tx")
  useEffect(() => {
    if (!client || client.isAuthenticated) return;

    const lastExecutedTx = ephemeralKVStore.get("notifi-last-executed-tx");
    console.log(`DEBUG -- useNotifiTxLogin (lastExecutedTx)`, lastExecutedTx);

    if (!lastExecutedTx) return;

    // Finalize! This will complete the login process with the tx that was just executed and
    // is expected to contain the signature/hash in the memo
    client
      .completeLoginViaTransaction({
        transactionSignature: lastExecutedTx.signature,
      })
      .then((result) => {
        console.log(
          `DEBUG -- useNotifiTxLogin (completeLoginViaTransaction success)`,
          result
        );
      })
      .catch((error) => {
        console.log(
          "DEBUG -- useNotifiTxLogin (completeLoginViaTransaction error)",
          error
        );
      });
  }, [client, ephemeralKVStore]);

  return {};
};
