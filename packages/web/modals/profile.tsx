import { Dec, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { formatICNSName, shorten } from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ComponentProps,
  ElementType,
  forwardRef,
  FunctionComponent,
  HTMLAttributes,
  useEffect,
  useState,
} from "react";
import { useCopyToClipboard, useTimeoutFn } from "react-use";

import {
  CopyIcon,
  ExternalLinkIcon,
  Icon,
  LogOutIcon,
  QRIcon,
} from "~/components/assets";
import { CreditCardIcon } from "~/components/assets/credit-card-icon";
import {
  Drawer,
  DrawerButton,
  DrawerContent,
  DrawerOverlay,
  DrawerPanel,
} from "~/components/drawers";
import { Spinner } from "~/components/loaders/spinner";
import { OneClickTradingRemainingTime } from "~/components/one-click-trading/one-click-remaining-time";
import { ProfileOneClickTradingSettings } from "~/components/one-click-trading/profile-one-click-trading-settings";
import { ArrowButton, Button } from "~/components/ui/button";
import { EventName } from "~/config";
import {
  getParametersFromOneClickTradingInfo,
  useFeatureFlags,
  useOneClickTradingSession,
  useTranslation,
} from "~/hooks";
import { useAmplitudeAnalytics, useDisclosure, useWindowSize } from "~/hooks";
import { useBridgeStore } from "~/hooks/bridge";
import { useCreateOneClickTradingSession } from "~/hooks/mutations/one-click-trading";
import { useIsCosmosNewAccount } from "~/hooks/use-is-cosmos-new-account";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { api } from "~/utils/trpc";

const QRCode = dynamic(() =>
  import("~/components/qrcode").then((module) => module.QRCode)
);

export const ProfileModal: FunctionComponent<
  ModalBaseProps & { icnsName?: string }
> = observer((props) => {
  const { t } = useTranslation();
  const { width } = useWindowSize();
  const { accountStore, profileStore } = useStore();
  const { logEvent } = useAmplitudeAnalytics();
  const router = useRouter();
  const fiatRampSelection = useBridgeStore((state) => state.fiatRampSelection);
  const featureFlags = useFeatureFlags();

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

  const wallet = accountStore.getWallet(accountStore.osmosisChainId);
  const { isNewAccount } = useIsCosmosNewAccount({ address: wallet?.address });
  const show1CT = featureFlags.oneClickTrading && !isNewAccount;

  const [show1CTSettings, setShow1CTSettings] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [_state, copyToClipboard] = useCopyToClipboard();
  const [_isReady, _cancel, reset] = useTimeoutFn(
    () => setHasCopied(false),
    2000
  );

  const address = wallet?.address ?? "";

  const { data: userOsmoAsset } = api.edge.assets.getUserAsset.useQuery(
    {
      findMinDenomOrSymbol: "OSMO",
      userOsmoAddress: wallet?.address ?? "",
    },
    {
      enabled: Boolean(wallet?.address) && typeof wallet?.address === "string",
    }
  );

  const onCopyAddress = () => {
    copyToClipboard(address);
    logEvent([EventName.ProfileModal.copyWalletAddressClicked]);
    setHasCopied(true);
    reset();
  };

  useEffect(() => {
    const onCloseModal = () => props.onRequestClose?.();
    router.events.on("routeChangeComplete", onCloseModal);
    return () => router.events.off("routeChangeComplete", onCloseModal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ModalBase
        title={!show1CTSettings ? t("profile.modalTitle") : ""}
        {...props}
        isOpen={props.isOpen}
        hideCloseButton={show1CTSettings}
        onRequestClose={() => {
          // Do not close the modal if the drawers are open
          if (!isQROpen && !isAvatarSelectOpen) return props.onRequestClose?.();

          // Close the drawers
          onCloseAvatarSelect();
          onCloseQR();
        }}
        onAfterClose={() => {
          setShow1CTSettings(false);
        }}
        className="relative max-h-screen overflow-hidden"
      >
        <div className="flex flex-col items-center overflow-auto">
          {show1CT && show1CTSettings ? (
            <ProfileOneClickTradingSettings
              onGoBack={() => setShow1CTSettings(false)}
              onClose={props.onRequestClose}
            />
          ) : (
            <>
              <Drawer
                isOpen={isAvatarSelectOpen}
                onOpen={onOpenAvatarSelect}
                onClose={onCloseAvatarSelect}
              >
                <DrawerButton className="transform transition-transform duration-300 ease-in-out hover:scale-105">
                  {profileStore.currentAvatar === "ammelia" ? (
                    <AmmeliaAvatar
                      className="mt-10"
                      aria-label="Select avatar"
                    />
                  ) : (
                    <WosmongtonAvatar
                      className="mt-10"
                      aria-label="Select avatar"
                    />
                  )}
                </DrawerButton>

                <DrawerContent>
                  <DrawerOverlay />
                  <DrawerPanel className="flex h-fit items-center justify-center pb-7 pt-7">
                    <h6 className="mb-8">Select an avatar</h6>
                    <div className="flex gap-8 xs:gap-3">
                      <div className="text-center">
                        <WosmongtonAvatar
                          isSelectable
                          isSelected={
                            profileStore.currentAvatar === "wosmongton"
                          }
                          onSelect={() => {
                            onCloseAvatarSelect();
                            logEvent([
                              EventName.ProfileModal.selectAvatarClicked,
                              { avatar: "wosmongton" },
                            ]);
                            profileStore.setCurrentAvatar("wosmongton");
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
                          isSelected={profileStore.currentAvatar === "ammelia"}
                          onSelect={() => {
                            onCloseAvatarSelect();
                            logEvent([
                              EventName.ProfileModal.selectAvatarClicked,
                              { avatar: "ammelia" },
                            ]);
                            profileStore.setCurrentAvatar("ammelia");
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
                <p className="subtitle1" title={props?.icnsName}>
                  {Boolean(props.icnsName)
                    ? formatICNSName(props.icnsName, width < 768 ? 32 : 48)
                    : shorten(address)}
                </p>
              </div>

              <div className="mt-7 flex w-full flex-col rounded-2xl border border-osmoverse-700 bg-osmoverse-800 ">
                <div className="flex w-full justify-between p-5">
                  <div className="flex flex-col gap-[30px]">
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

                    <div>
                      <h6 className="mb-[4px] tracking-wide text-osmoverse-100">
                        {formatPretty(
                          userOsmoAsset?.usdValue ??
                            new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0)),
                          {
                            minimumFractionDigits: 2,
                            maximumSignificantDigits: undefined,
                            notation: "standard",
                          }
                        )}
                      </h6>
                      <p className="text-h5 font-h5">
                        {formatPretty(userOsmoAsset?.amount ?? new Dec(0), {
                          minimumFractionDigits: 2,
                          maximumSignificantDigits: undefined,
                          notation: "standard",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-[30px] xs:mt-2 xs:items-start xs:gap-2">
                    <button
                      onClick={() => {
                        props.onRequestClose();
                        fiatRampSelection();
                      }}
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

                    <Link
                      href={
                        featureFlags.portfolioPageAndNewAssetsPage
                          ? "/portfolio"
                          : "/assets"
                      }
                      passHref
                      legacyBehavior
                    >
                      <ArrowButton isLink>
                        {t("profile.viewAllAssets")}
                      </ArrowButton>
                    </Link>
                  </div>
                </div>
                {featureFlags.transactionsPage && (
                  <Link href="/transactions" passHref>
                    <div className="flex w-full  cursor-pointer  items-center justify-between  border-t border-osmoverse-700 py-3 px-5 align-middle">
                      <div className="flex items-center gap-2">
                        <Icon id="history" />
                        <span className="subtitle1">
                          {t("profile.transactions")}
                        </span>
                      </div>
                      <Icon
                        id="chevron-right"
                        className="h-5 w-5 text-osmoverse-500"
                      />
                    </div>
                  </Link>
                )}
              </div>

              <div
                className={classNames(
                  "mt-5 flex w-full flex-col gap-[30px] border border-osmoverse-700 bg-osmoverse-800 p-5",
                  show1CT ? "rounded-t-2xl" : "rounded-2xl"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <Icon
                    id="wallet"
                    className="h-[24px] w-[24px] text-osmoverse-300"
                  />
                  <p className="subtitle1 tracking-wide text-osmoverse-300">
                    {t("profile.wallet")}
                  </p>
                </div>

                <div className="flex justify-between 1.5xl:gap-4 1.5xs:flex-col">
                  <div className="flex gap-3">
                    <div className="h-12 w-12 shrink-0">
                      <img
                        alt="wallet-icon"
                        src={wallet?.walletInfo.logo ?? "/"}
                        height={48}
                        width={48}
                      />
                    </div>

                    <div className="subtitle-1 tracking-wide">
                      <p>Cosmos</p>
                      <div className="flex items-center gap-2">
                        <p title={address} className="text-osmoverse-100">
                          {shorten(address)}
                        </p>
                        <button
                          title="Copy"
                          onClick={onCopyAddress}
                          className="group"
                        >
                          {hasCopied ? (
                            <Icon
                              id="check-mark"
                              className="h-[13px] w-[17px] text-osmoverse-200"
                            />
                          ) : (
                            <CopyIcon
                              classes={{
                                container:
                                  "w-[20px] h-[20px] text-osmoverse-200",
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
                      onClick={() => {
                        logEvent([
                          EventName.ProfileModal.blockExplorerLinkOutClicked,
                        ]);
                      }}
                    >
                      <ExternalLinkIcon isAnimated />
                    </ActionButton>

                    <Drawer
                      isOpen={isQROpen}
                      onOpen={() => {
                        logEvent([EventName.ProfileModal.qrCodeClicked]);
                        onOpenQR();
                      }}
                      onClose={onCloseQR}
                    >
                      <DrawerButton>
                        <ActionButton title="QR Code" className="group">
                          <QRIcon isAnimated />
                        </ActionButton>
                      </DrawerButton>

                      <DrawerContent>
                        <DrawerOverlay />
                        <DrawerPanel className="flex h-fit items-center justify-center pb-7 pt-7">
                          <h6 className="mb-8">Cosmos</h6>
                          <div className="mb-7 flex items-center justify-center rounded-xl bg-white-high p-3.5">
                            <QRCode value={address} size={260} />
                          </div>

                          <div className="flex items-center gap-4 rounded-3xl bg-osmoverse-700 px-5 py-1">
                            <p
                              title={address}
                              className="subtitle1 text-osmoverse-300"
                            >
                              {shorten(address, { prefixLength: 10 })}
                            </p>
                            <button
                              className="flex h-9 w-9 items-center justify-center"
                              onClick={onCopyAddress}
                            >
                              {hasCopied ? (
                                <div className="h-6 w-6">
                                  <Icon
                                    id="check-mark"
                                    className="h-[24px] w-[24px] text-osmoverse-200"
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
                      onClick={async () => {
                        logEvent([EventName.ProfileModal.logOutClicked]);
                        try {
                          setIsDisconnecting(true);
                          await wallet?.disconnect(true);
                          props.onRequestClose();
                        } catch (e) {
                          throw e;
                        } finally {
                          setIsDisconnecting(false);
                        }
                      }}
                      className="group hover:text-rust-500"
                    >
                      {isDisconnecting ? (
                        <Spinner className="text-white-full" />
                      ) : (
                        <LogOutIcon isAnimated />
                      )}
                    </ActionButton>
                  </div>
                </div>
              </div>
              {show1CT && !isNewAccount && (
                <OneClickTradingProfileSection
                  setShow1CTSettings={setShow1CTSettings}
                  onRestartSession={() => {
                    props.onRequestClose();
                  }}
                />
              )}
            </>
          )}
        </div>
      </ModalBase>
    </>
  );
});

const OneClickTradingProfileSection: FunctionComponent<{
  setShow1CTSettings: (value: boolean) => void;
  onRestartSession: () => void;
}> = ({ setShow1CTSettings, onRestartSession }) => {
  const { logEvent } = useAmplitudeAnalytics();
  const { accountStore } = useStore();
  const { t } = useTranslation();
  const { isOneClickTradingExpired, oneClickTradingInfo } =
    useOneClickTradingSession();

  const create1CTSession = useCreateOneClickTradingSession();
  const account = accountStore.getWallet(accountStore.osmosisChainId);

  const shouldFetchSessionAuthenticator =
    !!account?.address && !!oneClickTradingInfo;
  const { data: sessionAuthenticator } =
    api.local.oneClickTrading.getSessionAuthenticator.useQuery(
      {
        userOsmoAddress: account?.address ?? "",
        publicKey: oneClickTradingInfo?.publicKey ?? "",
      },
      {
        enabled: shouldFetchSessionAuthenticator,
        cacheTime: 15_000, // 15 seconds
        staleTime: 15_000, // 15 seconds
        retry: false,
      }
    );

  return (
    <div
      onClick={() => {
        setShow1CTSettings(true);
        logEvent([
          EventName.OneClickTrading.accessed,
          {
            source: "profile-section",
          },
        ]);
      }}
      className="group flex w-full cursor-pointer items-center justify-between rounded-b-2xl border border-t-0 border-osmoverse-700 bg-osmoverse-800 px-5 py-3"
    >
      <div className="flex items-center gap-2">
        <Image
          src="/images/1ct-small-icon.svg"
          alt="1-Click trading icon"
          width={24}
          height={24}
        />
        <p className="subtitle1 text-left tracking-wide">
          {t("profile.oneClickTrading")}
        </p>
        {isOneClickTradingExpired && oneClickTradingInfo && (
          <Button
            size="sm"
            isLoading={create1CTSession.isLoading}
            loadingText={null}
            classes={{
              spinner: "!h-4 !w-4",
            }}
            onClick={(e) => {
              e.stopPropagation();

              const transaction1CTParams = getParametersFromOneClickTradingInfo(
                {
                  oneClickTradingInfo,
                  defaultIsOneClickEnabled: true,
                }
              );
              create1CTSession.mutate(
                {
                  spendLimitTokenDecimals:
                    oneClickTradingInfo.spendLimit.decimals,
                  transaction1CTParams,
                  walletRepo: accountStore.getWalletRepo(
                    accountStore.osmosisChainId
                  ),
                  /**
                   * If the user has an existing session, remove it and add the new one.
                   */
                  additionalAuthenticatorsToRemove: sessionAuthenticator
                    ? [BigInt(sessionAuthenticator.id)]
                    : undefined,
                },
                {
                  onSuccess: () => {
                    onRestartSession();
                  },
                }
              );
            }}
          >
            {t("oneClickTrading.profile.restart")}
          </Button>
        )}
      </div>

      <button className="flex items-center gap-3 text-left">
        <OneClickTradingRemainingTime />
        <div className="flex transform transition-transform duration-100 group-hover:translate-x-1">
          <Icon
            id="chevron-right"
            className="text-osmoverse-500"
            height={18}
            width={18}
          />
        </div>
      </button>
    </div>
  );
};

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
        "h-[140px] w-[140px] overflow-hidden rounded-3xl",
        {
          "group transition-all duration-300 ease-in-out active:border-[2px] active:border-wosmongton-200":
            isSelectable,
          "border-[2px] border-wosmongton-200": isSelected,
        },
        props.className
      )}
      onClick={() => props.onSelect?.()}
    >
      <div
        className={classNames({
          "transform transition-transform duration-300 ease-in-out group-hover:scale-[1.13]":
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
            "hover:bg-[linear-gradient(139.12deg,#F35DC7_7.8%,#7B0DE2_88.54%)] hover:shadow-[0px_4px_20px_4px_#AA4990] focus:bg-[linear-gradient(139.12deg,#F35DC7_7.8%,#7B0DE2_88.54%)]",
          props.className
        )}
      >
        <Image
          alt="Wosmongton profile avatar"
          src="/images/profile-woz.svg"
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
            "hover:bg-[linear-gradient(139.12deg,#9044F2_7.8%,#6BFFFF_88.54%)] hover:shadow-[0px_0px_20px_4px_#60ADD3] focus:bg-[linear-gradient(139.12deg,#9044F2_7.8%,#6BFFFF_88.54%)]",
          props.className
        )}
      >
        <Image
          alt="Wosmongton profile avatar"
          src="/images/profile-ammelia.svg"
          width={140}
          height={140}
        />
      </BaseAvatar>
    );
  }
);
