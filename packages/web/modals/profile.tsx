import { ButtonHTMLAttributes, FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { ModalBase, ModalBaseProps } from "./base";
import { useTranslation } from "react-multi-lang";
import Image from "next/image";
import { CreditCardIcon } from "../components/assets/credit-card-icon";
import { useStore } from "../stores";
import { FiatRampsModal } from "./fiat-ramps";
import { useAmplitudeAnalytics, useTransferConfig } from "../hooks";
import { EventName } from "../config";
import { getShortAddress } from "../utils/string";
import { useCopyToClipboard, useTimeoutFn } from "react-use";

export const ProfileModal: FunctionComponent<ModalBaseProps> = observer(
  (props) => {
    const t = useTranslation();
    const {
      chainStore: {
        osmosis: { chainId },
      },
      accountStore,
      priceStore,
      navBarStore,
    } = useStore();
    const { logEvent } = useAmplitudeAnalytics();

    const transferConfig = useTransferConfig();
    const account = accountStore.getAccount(chainId);

    const [hasCopied, setHasCopied] = useState(false);
    const [_state, copyToClipboard] = useCopyToClipboard();
    const [_isReady, _cancel, reset] = useTimeoutFn(
      () => setHasCopied(false),
      2000
    );

    return (
      <ModalBase
        title={t("profile.modalTitle")}
        {...props}
        isOpen={props.isOpen}
        className="flex flex-col items-center"
      >
        <div className="mt-10 h-[140px] w-[140px] overflow-hidden rounded-[40px]">
          <Image
            alt="Wosmongton profile"
            src="/images/profile-woz.png"
            width={140}
            height={140}
          />
        </div>

        <div className="mt-3 text-center">
          <h5>dogemos.osmo</h5>
          <p className="text-osmoverse-300">Osmonaut since June 19, 2021</p>
        </div>

        <div className="mt-10 flex w-full flex-col gap-[30px] rounded-[20px] border border-osmoverse-700 bg-osmoverse-800 px-6 py-5">
          <div className="flex items-center gap-1.5">
            <Image
              src="/icons/profile-osmo.svg"
              alt="Osmo icon"
              width={24}
              height={24}
            />
            <p className="subtitle1 tracking-wide text-osmoverse-300">
              Balance
            </p>
          </div>

          <div className="flex justify-between">
            <div>
              <h6 className="mb-[3px] tracking-wide text-osmoverse-100">
                {priceStore
                  .calculatePrice(
                    navBarStore.walletInfo.balance,
                    priceStore.defaultVsCurrency
                  )
                  ?.toString()}
              </h6>
              <p className="text-h4 font-h4">
                {navBarStore.walletInfo.balance.toString()}
              </p>
            </div>

            <button
              onClick={() => transferConfig?.buyOsmo()}
              className="group flex items-center gap-[10px] self-end rounded-lg border-2 border-osmoverse-500 bg-osmoverse-700 py-[6px] px-5 hover:border-wosmongton-200"
            >
              <CreditCardIcon isAnimated />
              Buy Tokens
            </button>
          </div>
        </div>

        <div className="mt-5 flex w-full flex-col gap-[30px] rounded-[20px] border border-osmoverse-700 bg-osmoverse-800 px-6 py-5">
          <div className="flex items-center gap-1.5">
            <Image
              src="/icons/profile-wallet.svg"
              alt="Osmo icon"
              width={24}
              height={24}
            />
            <p className="subtitle1 tracking-wide text-osmoverse-300">Wallet</p>
          </div>

          <div className="flex justify-between">
            <div className="flex gap-3">
              <div className="h-12 w-12 shrink-0">
                <Image
                  alt="wallet-icon"
                  src={navBarStore.walletInfo.logoUrl}
                  height={48}
                  width={48}
                />
              </div>

              <div className="subtitle-1 tracking-wide">
                <p>Cosmos</p>
                <p className="text-osmoverse-100">
                  {getShortAddress(account.bech32Address)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ActionButton
                title="Copy Address"
                onClick={() => {
                  copyToClipboard(account.bech32Address);
                  setHasCopied(true);
                  reset();
                }}
              >
                {hasCopied ? (
                  <Image
                    src="/icons/check-mark.svg"
                    alt="Check mark icon"
                    width={20}
                    height={20}
                  />
                ) : (
                  <Image
                    src="/icons/copy-white.svg"
                    alt="Osmo icon"
                    width={24}
                    height={24}
                  />
                )}
              </ActionButton>
              <ActionButton title="Show QR Code">
                <Image
                  src="/icons/qr.svg"
                  alt="Osmo icon"
                  width={24}
                  height={24}
                />
              </ActionButton>
              <ActionButton
                title="Sign Out"
                onClick={() => {
                  logEvent([EventName.Topnav.signOutClicked]);
                  props.onRequestClose();
                  account.disconnect();
                }}
              >
                <Image
                  src="/icons/log-out.svg"
                  alt="Osmo icon"
                  width={24}
                  height={24}
                />
              </ActionButton>
            </div>
          </div>
        </div>

        {transferConfig?.fiatRampsModal && (
          <FiatRampsModal {...transferConfig.fiatRampsModal} />
        )}
      </ModalBase>
    );
  }
);

const ActionButton: FunctionComponent<
  ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
  return (
    <button
      {...props}
      className="flex h-9 w-9 items-center justify-center rounded-lg bg-osmoverse-600 p-1.5 hover:bg-osmoverse-500"
    >
      {props.children}
    </button>
  );
};
