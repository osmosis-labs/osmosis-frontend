import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Keplr } from "@keplr-wallet/types";
import { getKeplrFromWindow } from "@keplr-wallet/stores";
import { KeplrConnectionSelectModal, WalletConnectQRModal } from "../../modals";
import EventEmitter from "eventemitter3";
import { BroadcastMode, StdTx } from "@cosmjs/launchpad";
import Axios from "axios";
import { ChainInfos } from "../../config";
import { Buffer } from "buffer";
import WalletConnect from "@walletconnect/client";
import { KeplrWalletConnectV1 } from "@keplr-wallet/wc-client";
import { isMobile } from "@walletconnect/browser-utils";
import { useAmplitudeAnalytics } from "../use-amplitude-analytics";

export async function sendTxWC(
  chainId: string,
  tx: StdTx | Uint8Array,
  mode: BroadcastMode
): Promise<Uint8Array> {
  const restInstance = Axios.create({
    baseURL: ChainInfos.find((chainInfo) => chainInfo.chainId === chainId)!
      .rest,
  });

  const isProtoTx = Buffer.isBuffer(tx) || tx instanceof Uint8Array;

  const params = isProtoTx
    ? {
        tx_bytes: Buffer.from(tx as any).toString("base64"),
        mode: (() => {
          switch (mode) {
            case "async":
              return "BROADCAST_MODE_ASYNC";
            case "block":
              return "BROADCAST_MODE_BLOCK";
            case "sync":
              return "BROADCAST_MODE_SYNC";
            default:
              return "BROADCAST_MODE_UNSPECIFIED";
          }
        })(),
      }
    : {
        tx,
        mode: mode,
      };

  const result = await restInstance.post(
    isProtoTx ? "/cosmos/tx/v1beta1/txs" : "/txs",
    params
  );

  const txResponse = isProtoTx ? result.data["tx_response"] : result.data;

  if (txResponse.code != null && txResponse.code !== 0) {
    throw new Error(txResponse["raw_log"]);
  }

  return Buffer.from(txResponse.txhash, "hex");
}

export const GetKeplrContext = createContext<{
  getKeplr(): Promise<Keplr | undefined>;
  clearLastUsedKeplr(): void;
  connectionType?: "extension" | "wallet-connect";
  setDefaultConnectionType(
    type: "extension" | "wallet-connect" | undefined
  ): void;
} | null>(null);

export const GetKeplrProvider: FunctionComponent = ({ children }) => {
  const [isExtensionSelectionModalOpen, setIsExtensionSelectionModalOpen] =
    useState(false);
  const [isExtentionNotInstalled, setIsExtensionNotInstalled] = useState(false);
  const [wcUri, setWCUri] = useState("");
  const { setUserProperty } = useAmplitudeAnalytics();

  const lastUsedKeplrRef = useRef<Keplr | undefined>();
  const defaultConnectionTypeRef = useRef<
    "extension" | "wallet-connect" | undefined
  >();
  const [connectionType, setConnectionType] = useState<
    "extension" | "wallet-connect" | undefined
  >();
  const [eventListener] = useState(() => new EventEmitter());

  const [getKeplr] = useState(() => (): Promise<Keplr | undefined> => {
    if (typeof window === "undefined") {
      return Promise.resolve(undefined);
    }

    if (lastUsedKeplrRef.current) {
      return Promise.resolve(lastUsedKeplrRef.current);
    }

    if (defaultConnectionTypeRef.current === "extension") {
      return getKeplrFromWindow().then((keplr) => {
        lastUsedKeplrRef.current = keplr;
        setConnectionType("extension");
        return keplr;
      });
    }

    let callbackClosed: (() => void) | undefined;

    const createWalletConnect = (): WalletConnect => {
      const wcLogoURI = require("../../public/osmosis-logo-wc.png")?.default
        ?.src;

      const wc = new WalletConnect({
        bridge: "https://bridge.walletconnect.org", // Required
        signingMethods: [
          "keplr_enable_wallet_connect_v1",
          "keplr_sign_amino_wallet_connect_v1",
        ],
        qrcodeModal: {
          open: (uri: string, cb: any) => {
            setWCUri(uri);
            callbackClosed = cb;
          },
          close: () => setWCUri(""),
        },
      });

      // XXX: I don't know why they designed that the client meta options in the constructor should be always ingored...
      // @ts-ignore
      wc._clientMeta = {
        name: "Osmosis",
        description: "Osmosis is the first IBC-native Cosmos interchain AMM",
        url: "https://app.osmosis.zone",
        icons: wcLogoURI
          ? [
              // Keplr mobile app can't show svg image.
              window.location.origin + wcLogoURI,
            ]
          : [],
      };

      return wc;
    };

    if (defaultConnectionTypeRef.current === "wallet-connect") {
      const connector = createWalletConnect();

      if (connector.connected) {
        const keplr = new KeplrWalletConnectV1(connector, {
          sendTx: sendTxWC,
        });
        lastUsedKeplrRef.current = keplr;
        setConnectionType("wallet-connect");
        return Promise.resolve(keplr);
      }
    }

    return (async () => {
      // First, try to get keplr from window.
      const keplrFromWindow = await getKeplrFromWindow();

      if (!isMobile()) {
        // If on mobile browser environment,
        // no need to open select modal.
        setIsExtensionSelectionModalOpen(true);
      }

      return await new Promise((resolve, reject) => {
        const cleanUp = () => {
          eventListener.off("extension_selection_modal_close");
          eventListener.off("select_extension");
          eventListener.off("select_wallet_connect");
          eventListener.off("wc_modal_close");
          eventListener.off("connect");
          eventListener.off("keplr_install_modal_close");
        };

        eventListener.on("extension_selection_modal_close", () => {
          setIsExtensionSelectionModalOpen(false);
          reject();
          cleanUp();
        });

        eventListener.on("keplr_install_modal_close", () => {
          setIsExtensionNotInstalled(false);
          reject();
          cleanUp();
        });

        eventListener.on("select_extension", () => {
          setIsExtensionSelectionModalOpen(false);

          getKeplrFromWindow().then((keplr) => {
            lastUsedKeplrRef.current = keplr;
            setConnectionType("extension");
            setUserProperty("isWalletConnected", true);
            setUserProperty("connectedWallet", "extension");
            resolve(keplr);
            cleanUp();
          });
        });

        eventListener.on("select_wallet_connect", () => {
          const connector = createWalletConnect();

          eventListener.on("wc_modal_close", () => {
            setWCUri("");
            if (callbackClosed) {
              callbackClosed();
            }
          });

          // Check if connection is already established
          if (!connector.connected) {
            // create new session
            connector.createSession();

            connector.on("connect", (error) => {
              cleanUp();
              if (error) {
                reject(error);
              } else {
                const keplr = new KeplrWalletConnectV1(connector, {
                  sendTx: sendTxWC,
                });
                setIsExtensionSelectionModalOpen(false);
                lastUsedKeplrRef.current = keplr;
                setConnectionType("wallet-connect");
                setUserProperty("isWalletConnected", true);
                setUserProperty("connectedWallet", "wallet-connect");
                resolve(keplr);
              }
            });
          } else {
            const keplr = new KeplrWalletConnectV1(connector, {
              sendTx: sendTxWC,
            });
            setIsExtensionSelectionModalOpen(false);
            lastUsedKeplrRef.current = keplr;
            setConnectionType("wallet-connect");
            setUserProperty("isWalletConnected", true);
            setUserProperty("connectedWallet", "wallet-connect");
            resolve(keplr);
            cleanUp();
          }
        });

        if (isMobile()) {
          if (keplrFromWindow && keplrFromWindow.mode === "mobile-web") {
            // If mobile with `keplr` in `window`, it means that user enters frontend from keplr app's in app browser.
            // So, their is no need to use wallet connect, and it resembles extension's usages.
            eventListener.emit("select_extension");
          } else {
            // Force emit "select_wallet_connect" event if on mobile browser environment.
            eventListener.emit("select_wallet_connect");
          }
        }
      });
    })();
  });

  useEffect(() => {
    getKeplrFromWindow().then((keplr) => {
      if (!keplr) {
        setIsExtensionNotInstalled(true);
      }
    });
  });

  return (
    <GetKeplrContext.Provider
      value={{
        getKeplr,
        clearLastUsedKeplr: useCallback(() => {
          lastUsedKeplrRef.current = undefined;
          setConnectionType(undefined);
        }, []),
        setDefaultConnectionType: useCallback(
          (type: "extension" | "wallet-connect" | undefined) => {
            defaultConnectionTypeRef.current = type;
          },
          []
        ),
        connectionType,
      }}
    >
      <KeplrConnectionSelectModal
        isOpen={isExtensionSelectionModalOpen}
        overrideWithKeplrInstallLink={
          isExtentionNotInstalled ? "https://www.keplr.app/" : undefined
        }
        onRequestClose={() => {
          eventListener.emit("extension_selection_modal_close");
        }}
        onSelectExtension={() => {
          eventListener.emit("select_extension");
        }}
        onSelectWalletConnect={() => {
          eventListener.emit("select_wallet_connect");
        }}
      />
      <WalletConnectQRModal
        isOpen={wcUri.length > 0}
        onRequestClose={() => {
          eventListener.emit("wc_modal_close");
        }}
        uri={wcUri}
      />
      {children}
    </GetKeplrContext.Provider>
  );
};
