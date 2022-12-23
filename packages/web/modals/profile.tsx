import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { ModalBase, ModalBaseProps } from "./base";
import { useTranslation } from "react-multi-lang";
import Image from "next/image";
import { CreditCardIcon } from "../components/assets/credit-card-icon";
import { useStore } from "../stores";

export const ProfileModal: FunctionComponent<ModalBaseProps> = observer(
  (props) => {
    const t = useTranslation();
    const {
      chainStore: {
        osmosis: { chainId },
      },
      accountStore,
      navBarStore,
    } = useStore();

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
                $21,594,023.12
              </h6>
              <p className="text-h4 font-h4">2,958,0246 OSMO</p>
            </div>

            <button className="flex items-center gap-[10px] self-end rounded-lg border-2 border-osmoverse-500 bg-osmoverse-700 py-[6px] px-5">
              <CreditCardIcon />
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
                <p className="text-osmoverse-100">cos19b...9301x</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                title="Copy Address"
                className="h-9 w-9 rounded-lg bg-osmoverse-600 p-1.5"
              >
                <Image
                  src="/icons/copy-white.svg"
                  alt="Osmo icon"
                  width={24}
                  height={24}
                />
              </button>
              <button
                title="Show QR Code"
                className="h-9 w-9 rounded-lg bg-osmoverse-600 p-1.5"
              >
                <Image
                  src="/icons/qr.svg"
                  alt="Osmo icon"
                  width={24}
                  height={24}
                />
              </button>
              <button
                title="Sign Out"
                className="h-9 w-9 rounded-lg bg-osmoverse-600 p-1.5"
              >
                <Image
                  src="/icons/log-out.svg"
                  alt="Osmo icon"
                  width={24}
                  height={24}
                />
              </button>
            </div>
          </div>
        </div>
      </ModalBase>
    );
  }
);
