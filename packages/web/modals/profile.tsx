import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ComponentProps,
  ElementType,
  forwardRef,
  FunctionComponent,
  HTMLAttributes,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { ModalBase, ModalBaseProps } from "./base";
import { useTranslation } from "react-multi-lang";
import Image from "next/image";
import { CreditCardIcon } from "../components/assets/credit-card-icon";
import { useStore } from "../stores";
import { FiatRampsModal } from "./fiat-ramps";
import {
  useAmplitudeAnalytics,
  useDisclosure,
  useTransferConfig,
} from "../hooks";
import { EventName } from "../config";
import { useCopyToClipboard, useTimeoutFn } from "react-use";
import {
  CopyIcon,
  LogOutIcon,
  QRIcon,
  ExternalLinkIcon,
  CheckMarkIcon,
} from "../components/assets";
import classNames from "classnames";
import {
  Drawer,
  DrawerButton,
  DrawerContent,
  DrawerOverlay,
  DrawerPanel,
} from "../components/drawers";
import QRCode from "qrcode.react";
import { AvatarState } from "../stores/user-settings";
import { Bech32Address } from "@keplr-wallet/cosmos";

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
      userSettings,
    } = useStore();
    const { logEvent } = useAmplitudeAnalytics();

    const {
      isOpen: isAvatarSelectOpen,
      onClose: onCloseAvatarSelect,
      onOpen: onOpenAvatarSelect,
    } = useDisclosure();
    const {
      isOpen: isQROpen,
      onClose: onCloseQR,
      onOpen: onOpenQR,
    } = useDisclosure();

    const transferConfig = useTransferConfig();
    const account = accountStore.getAccount(chainId);
    const avatarSetting =
      userSettings.getUserSettingById<AvatarState>("avatar");

    const [hasCopied, setHasCopied] = useState(false);
    const [_state, copyToClipboard] = useCopyToClipboard();
    const [_isReady, _cancel, reset] = useTimeoutFn(
      () => setHasCopied(false),
      2000
    );

    const onCopyAddress = () => {
      copyToClipboard(account.bech32Address);
      setHasCopied(true);
      reset();
    };

    const address = account.bech32Address;

    return (
      <ModalBase
        title={t("profile.modalTitle")}
        {...props}
        isOpen={props.isOpen}
        onRequestClose={() => {
          // Do not close the modal if the drawers are open
          if (!isQROpen && !isAvatarSelectOpen) return props.onRequestClose?.();

          // Close the drawers
          onCloseAvatarSelect();
          onCloseQR();
        }}
        className="relative flex flex-col items-center overflow-hidden"
      >
        <Drawer
          isOpen={isAvatarSelectOpen}
          onOpen={onOpenAvatarSelect}
          onClose={onCloseAvatarSelect}
        >
          <DrawerButton>
            {avatarSetting?.state.avatar === "ammelia" ? (
              <AmmeliaAvatar className="mt-10" aria-label="Select avatar" />
            ) : (
              <WosmongtonAvatar className="mt-10" aria-label="Select avatar" />
            )}
          </DrawerButton>

          <DrawerContent>
            <DrawerOverlay />
            <DrawerPanel className="flex h-fit items-center justify-center pt-7 pb-7">
              <h6 className="mb-8">Select an avatar</h6>
              <div className="flex gap-8 xs:gap-3">
                <div className="text-center">
                  <WosmongtonAvatar
                    isSelectable
                    isSelected={avatarSetting?.state.avatar === "wosmongton"}
                    onSelect={() => {
                      onCloseAvatarSelect();
                      avatarSetting?.setState({ avatar: "wosmongton" });
                    }}
                    className="outline-none"
                  />
                  <p className="subtitle1 mt-4 tracking-wide text-osmoverse-300">
                    Wosmongton
                  </p>
                </div>

                <div className="text-center">
                  <AmmeliaAvatar
                    isSelectable
                    isSelected={avatarSetting?.state.avatar === "ammelia"}
                    onSelect={() => {
                      onCloseAvatarSelect();
                      avatarSetting?.setState({ avatar: "ammelia" });
                    }}
                    className="outline-none"
                  />
                  <p className="subtitle1 mt-4 tracking-wide text-osmoverse-300">
                    Ammelia
                  </p>
                </div>
              </div>
            </DrawerPanel>
          </DrawerContent>
        </Drawer>

        <div className="mt-3 text-center">
          <h5>{Bech32Address.shortenAddress(address, 12)}</h5>
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
              {t("profile.balance")}
            </p>
          </div>

          <div className="flex justify-between 1.5xs:flex-col 1.5xs:gap-4">
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
              className="subtitle1 group flex h-[44px] items-center gap-[10px] rounded-lg border-2 border-osmoverse-500 bg-osmoverse-700 py-[6px] px-3.5 hover:border-transparent hover:bg-gradient-positive hover:bg-origin-border hover:text-black hover:shadow-[0px_0px_30px_4px_rgba(57,255,219,0.2)] 1.5xs:self-start"
            >
              <CreditCardIcon
                isAnimated
                classes={{
                  backCard: "group-hover:stroke-[2]",
                  frontCard:
                    "group-hover:fill-[#71B5EB] group-hover:stroke-[2]",
                }}
              />
              <span>{t("buyTokens")}</span>
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
            <p className="subtitle1 tracking-wide text-osmoverse-300">
              {t("profile.wallet")}
            </p>
          </div>

          <div className="flex justify-between 1.5xl:gap-4 1.5xs:flex-col">
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
                <div className="flex items-center gap-2">
                  <p title={address} className="text-osmoverse-100">
                    {Bech32Address.shortenAddress(address, 12)}
                  </p>
                  <button
                    title="Copy"
                    onClick={onCopyAddress}
                    className="group"
                  >
                    {hasCopied ? (
                      <CheckMarkIcon
                        classes={{
                          container: "text-osmoverse-200",
                        }}
                      />
                    ) : (
                      <CopyIcon
                        classes={{
                          container: "w-[20px] h-[20px] text-osmoverse-200",
                        }}
                        isAnimated
                      />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ActionButton
                title="Mintscan"
                isLink
                href={`https://www.mintscan.io/osmosis/account/${address}`}
                target="blank"
                className="group"
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon isAnimated />
              </ActionButton>

              <Drawer isOpen={isQROpen} onOpen={onOpenQR} onClose={onCloseQR}>
                <DrawerButton>
                  <ActionButton title="QR Code" className="group">
                    <QRIcon isAnimated />
                  </ActionButton>
                </DrawerButton>

                <DrawerContent>
                  <DrawerOverlay />
                  <DrawerPanel className="flex h-fit items-center justify-center pt-7 pb-7">
                    <h6 className="mb-8">Cosmos</h6>
                    <div className="mb-7 flex items-center justify-center rounded-xl bg-white-high p-3.5">
                      <QRCode value={address} size={260} />
                    </div>

                    <div className="flex items-center gap-4 rounded-3xl bg-osmoverse-700 px-5 py-1">
                      <p
                        title={address}
                        className="subtitle1 text-osmoverse-300"
                      >
                        {Bech32Address.shortenAddress(address, 15)}
                      </p>
                      <button
                        className="flex h-9 w-9 items-center justify-center"
                        onClick={onCopyAddress}
                      >
                        {hasCopied ? (
                          <div className="h-6 w-6">
                            <CheckMarkIcon
                              classes={{
                                container:
                                  "w-[24px] h-[24px] text-osmoverse-200",
                              }}
                            />
                          </div>
                        ) : (
                          <CopyIcon
                            isAnimated
                            classes={{
                              container: "text-osmoverse-200",
                            }}
                          />
                        )}
                      </button>
                    </div>
                  </DrawerPanel>
                </DrawerContent>
              </Drawer>

              <ActionButton
                title="Log Out"
                onClick={() => {
                  logEvent([EventName.Topnav.signOutClicked]);
                  props.onRequestClose();
                  account.disconnect();
                }}
                className="group hover:text-rust-500"
              >
                <LogOutIcon isAnimated />
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

const ActionButton = forwardRef<
  any,
  ButtonHTMLAttributes<HTMLButtonElement> &
    AnchorHTMLAttributes<HTMLAnchorElement> & { isLink?: boolean }
>((props, ref) => {
  const { isLink, ...rest } = props;
  const Component = (isLink ? "a" : "button") as ElementType<typeof props>;
  return (
    <Component
      {...rest}
      ref={ref}
      className={classNames(
        "flex h-9 w-9 items-center justify-center rounded-lg bg-osmoverse-600 p-1.5",
        props.className
      )}
    >
      {props.children}
    </Component>
  );
});

const BaseAvatar = forwardRef<
  any,
  HTMLAttributes<HTMLButtonElement> & {
    isSelectable?: boolean;
    isSelected?: boolean;
    onSelect?: () => void;
  }
>(({ isSelectable, isSelected, ...props }, ref) => {
  return (
    <button
      {...props}
      ref={ref}
      className={classNames(
        "h-[140px] w-[140px] overflow-hidden rounded-[40px]",
        {
          "group transition-all duration-300 ease-in-out active:border-[3px] active:border-osmoverse-100":
            isSelectable,
          "border-[3px] border-osmoverse-100": isSelected,
        },
        props.className
      )}
      onClick={() => props.onSelect?.()}
    >
      <div
        className={classNames({
          "transform transition-transform duration-300 ease-in-out group-hover:scale-110":
            isSelectable,
        })}
      >
        {props.children}
      </div>
    </button>
  );
});

const WosmongtonAvatar = forwardRef<any, ComponentProps<typeof BaseAvatar>>(
  (props, ref) => {
    return (
      <BaseAvatar
        {...props}
        ref={ref}
        className={classNames(
          "bg-[linear-gradient(139.12deg,#A247B9_7.8%,#460E7F_88.54%)]",
          props.isSelectable &&
            "hover:bg-[linear-gradient(139.12deg,#F35DC7_7.8%,#7B0DE2_88.54%)] hover:shadow-[0px_4px_20px_4px_#AA4990] focus:bg-[linear-gradient(139.12deg,#F35DC7_7.8%,#7B0DE2_88.54%)] focus:shadow-[0px_4px_20px_4px_#AA4990]",
          props.className
        )}
      >
        <Image
          alt="Wosmongton profile avatar"
          src="/images/profile-woz.png"
          width={140}
          height={140}
        />
      </BaseAvatar>
    );
  }
);

const AmmeliaAvatar = forwardRef<any, ComponentProps<typeof BaseAvatar>>(
  (props, ref) => {
    return (
      <BaseAvatar
        {...props}
        ref={ref}
        className={classNames(
          "bg-[linear-gradient(139.12deg,#462ADF_7.8%,#4ECAFF_88.54%)]",
          props.isSelectable &&
            "hover:bg-[linear-gradient(139.12deg,#9044F2_7.8%,#6BFFFF_88.54%)] hover:shadow-[0px_0px_20px_4px_#60ADD3] focus:bg-[linear-gradient(139.12deg,#9044F2_7.8%,#6BFFFF_88.54%)] focus:shadow-[0px_0px_20px_4px_#60ADD3]",
          props.className
        )}
      >
        <Image
          alt="Wosmongton profile avatar"
          src="/images/profile-ammelia.png"
          width={140}
          height={140}
        />
      </BaseAvatar>
    );
  }
);
