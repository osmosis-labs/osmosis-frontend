import { Listbox } from "@headlessui/react";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { Dec, PricePretty } from "@keplr-wallet/unit";
import axios from "axios";
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
  useCallback,
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
import { ArrowButton } from "~/components/buttons";
import {
  Drawer,
  DrawerButton,
  DrawerContent,
  DrawerOverlay,
  DrawerPanel,
} from "~/components/drawers";
import Spinner from "~/components/spinner";
import { EventName, STARGAZE_GRAPHQL_API } from "~/config";
import { useTranslation } from "~/hooks";
import { useAmplitudeAnalytics, useDisclosure, useWindowSize } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { FiatOnrampSelectionModal } from "~/modals/fiat-on-ramp-selection";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { formatICNSName, getShortAddress } from "~/utils/string";

const QRCode = dynamic(() => import("~/components/qrcode"));

type Collection = {
  name: string;
  contractAddress: string;
};

type Token = {
  name: string;
  media: {
    visualAssets: {
      md: {
        staticUrl: string;
      };
    };
    type: string;
  };
};

export const ProfileModal: FunctionComponent<
  ModalBaseProps & { icnsName?: string }
> = observer((props) => {
  const { t } = useTranslation();
  const { width } = useWindowSize();
  const {
    chainStore: {
      osmosis: { chainId },
    },
    accountStore,
    priceStore,
    profileStore,
    navBarStore,
  } = useStore();
  const { logEvent } = useAmplitudeAnalytics();
  const router = useRouter();

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
  const {
    isOpen: isFiatOnrampSelectionOpen,
    onOpen: onOpenFiatOnrampSelection,
    onClose: onCloseFiatOnrampSelection,
  } = useDisclosure();
  const {
    isOpen: isStargazePfpSelectOpen,
    onClose: onCloseStargazePfpSelect,
    onOpen: onOpenStargazePfpSelect,
  } = useDisclosure();

  const wallet = accountStore.getWallet(chainId);
  const address = wallet?.address ?? "";
  const stargazeAddress =
    address.length > 0
      ? Bech32Address.fromBech32(address, "osmo").toBech32("stars")
      : "";

  const [hasCopied, setHasCopied] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [_state, copyToClipboard] = useCopyToClipboard();
  const [_isReady, _cancel, reset] = useTimeoutFn(
    () => setHasCopied(false),
    2000
  );
  const [stargazeNFTs, setStargazeNFTs] = useState<Token[]>([]);
  const [stargazeBadges, setStargazeBadges] = useState<Token[]>([]);
  const [stargazeCollections, setStargazeCollections] = useState<Collection[]>(
    []
  );
  const [selectedCollection, setSelectedCollection] = useState<
    Collection | undefined
  >(undefined);
  const [searchCollectionValue, setSearchCollectionValue] = useState("");
  const [searchTokenValue, setSearchTokenValue] = useState("");
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [loadingNFTs, setLoadingNFTs] = useState(false);

  const filteredCollections = stargazeCollections?.filter((collection) =>
    collection.name.toLowerCase().includes(searchCollectionValue.toLowerCase())
  );

  const sortedFilteredCollections = filteredCollections?.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });

  const filteredTokens =
    selectedCollection?.name === "Badges"
      ? stargazeBadges?.filter((token) =>
          token.name.toLowerCase().includes(searchTokenValue.toLowerCase())
        )
      : stargazeNFTs?.filter((token) =>
          token.name.toLowerCase().includes(searchTokenValue.toLowerCase())
        );

  const tokensWithImage = filteredTokens?.filter(
    (nft) =>
      nft?.media?.type === "image" ||
      nft?.media?.type === "animated_image" ||
      nft?.media?.type === "video"
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

  const fetchStargazeBadges = useCallback(async () => {
    if (stargazeAddress.length > 0) {
      axios({
        url: STARGAZE_GRAPHQL_API,
        method: "post",
        data: {
          query: `
            query Badges {
              badges(ownerAddrOrName: "${stargazeAddress}", limit: 100) {
                tokens {
                  name
                  media {
                    type
                    visualAssets {
                      md {
                        staticUrl
                      }
                    }
                  }
                }
              }
            }
            `,
        },
      })
        .then((result) => {
          if (result?.data?.data?.badges?.tokens?.length > 0) {
            setStargazeCollections((prev) => {
              if (!prev.some((collection) => collection.name === "Badges")) {
                return [...prev, { name: "Badges", contractAddress: "" }];
              }
              return prev;
            });

            setStargazeBadges(result?.data?.data?.badges?.tokens);
          }
          setLoadingNFTs(false);
        })
        .catch((error) => {
          console.log("Error: ", error);
          setStargazeBadges([]);
          setLoadingNFTs(false);
        });
    }
  }, [stargazeAddress]);

  const fetchStargazeNFTs = useCallback(async () => {
    if (selectedCollection && stargazeAddress.length > 0) {
      setLoadingNFTs(true);
      axios({
        url: STARGAZE_GRAPHQL_API,
        method: "post",
        data: {
          query: `
            query Image {
              tokens(collectionAddr: "${selectedCollection.contractAddress}", owner: "${stargazeAddress}", limit: 100) {
                tokens {
                  media {
                    type
                    visualAssets {
                      md {
                        staticUrl
                      }
                    }
                  }
                  name
                }
              }
            }
            `,
        },
      })
        .then((result) => {
          setStargazeNFTs(result?.data?.data?.tokens?.tokens);
          setLoadingNFTs(false);
        })
        .catch((error) => {
          console.log("Error: ", error);
          setStargazeNFTs([]);
          setLoadingNFTs(false);
        });
    }
  }, [selectedCollection, stargazeAddress]);

  const fetchStargazeCollections = useCallback(async () => {
    if (stargazeAddress.length > 0) {
      setLoadingCollections(true);
      setStargazeCollections([]);
      setStargazeNFTs([]);
      setSelectedCollection(undefined);
      axios({
        url: STARGAZE_GRAPHQL_API,
        method: "post",
        data: {
          query: `
              query CollectionsWithCounts {
                collectionsWithCounts(owner: "${stargazeAddress.toString()}", limit: 100) {
                  collections {
                    contractAddress
                    name
                  }
                }
              }
              `,
        },
      })
        .then((result) => {
          if (result?.data?.data?.collectionsWithCounts?.collections !== null) {
            setStargazeCollections(
              result?.data?.data?.collectionsWithCounts?.collections
            );
          } else {
            setStargazeCollections([]);
          }
          fetchStargazeBadges();
          setLoadingCollections(false);
        })
        .catch((error) => {
          console.log("Error: ", error);
          setStargazeCollections([]);
          setLoadingCollections(false);
        });
    }
  }, [stargazeAddress]);

  useEffect(() => {
    if (stargazeAddress.length > 0) {
      fetchStargazeCollections();
      fetchStargazeBadges();
    }
  }, [fetchStargazeCollections, fetchStargazeBadges, stargazeAddress]);

  useEffect(() => {
    setSearchTokenValue("");
    if (
      stargazeAddress.length > 0 &&
      selectedCollection &&
      selectedCollection.name !== "Badges"
    ) {
      fetchStargazeNFTs();
    }
  }, [fetchStargazeNFTs, selectedCollection, stargazeAddress]);

  return (
    <>
      <ModalBase
        title={t("profile.modalTitle")}
        {...props}
        isOpen={props.isOpen}
        onRequestClose={() => {
          if (!isQROpen && !isAvatarSelectOpen && !isStargazePfpSelectOpen)
            return props.onRequestClose?.();

          onCloseAvatarSelect();
          onCloseStargazePfpSelect();
          onCloseQR();
        }}
        className="relative max-h-screen overflow-hidden"
      >
        <div className="flex flex-col items-center overflow-auto">
          <Drawer
            isOpen={isAvatarSelectOpen}
            onOpen={onOpenAvatarSelect}
            onClose={() => {
              onCloseAvatarSelect();
              onCloseStargazePfpSelect();
            }}
          >
            <DrawerButton className="transform transition-transform duration-300 ease-in-out hover:scale-105">
              {profileStore.currentAvatar === "ammelia" ? (
                <AmmeliaAvatar className="mt-10" aria-label="Select avatar" />
              ) : profileStore.currentAvatar === "wosmongton" ? (
                <WosmongtonAvatar
                  className="mt-10"
                  aria-label="Select avatar"
                />
              ) : profileStore.currentAvatar === "stargaze-pfp" ? (
                <StargazeAvatar
                  className="mt-10"
                  aria-label="Select avatar"
                  customurl={profileStore.stargazeAvatarUri}
                />
              ) : null}
            </DrawerButton>

            <DrawerContent>
              <DrawerOverlay />
              <DrawerPanel className="flex h-[55%] items-center justify-center pt-7 pb-7">
                <h6 className="mb-8">Select an avatar</h6>
                <div className="flex gap-8 xs:gap-3">
                  <div className="text-center">
                    <WosmongtonAvatar
                      isSelectable
                      isSelected={profileStore.currentAvatar === "wosmongton"}
                      onSelect={() => {
                        onCloseAvatarSelect();
                        logEvent([
                          EventName.ProfileModal.selectAvatarClicked,
                          { avatar: "wosmongton" },
                        ]);
                        profileStore.setCurrentAvatar("wosmongton");
                      }}
                      className="outline-none sm:w-full"
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
                    <p className="subtitle1 mt-4 tracking-wide text-osmoverse-300 sm:w-full">
                      Ammelia
                    </p>
                  </div>

                  <div className="text-center">
                    <Drawer
                      isOpen={isStargazePfpSelectOpen}
                      onOpen={onOpenStargazePfpSelect}
                      onClose={onCloseStargazePfpSelect}
                    >
                      <DrawerButton>
                        <div>
                          <SelectNewAvatar
                            isSelectable
                            isSelected={
                              profileStore.currentAvatar === "stargaze-pfp"
                            }
                            onSelect={() => {
                              onOpenStargazePfpSelect();
                              logEvent([
                                EventName.ProfileModal.selectAvatarClicked,
                                { avatar: "stargaze-pfp" },
                              ]);
                            }}
                            className="outline-none sm:w-full"
                          />
                          <p className="subtitle1 mt-4 tracking-wide text-osmoverse-300">
                            Stargaze NFT
                          </p>
                        </div>
                      </DrawerButton>
                      <DrawerContent>
                        <DrawerOverlay />
                        <DrawerPanel className="mt-4 flex items-center justify-center pt-8 pb-8">
                          <div className="flex flex-row gap-4">
                            <Listbox
                              defaultValue={selectedCollection?.name}
                              onChange={(value) => {
                                setSelectedCollection(
                                  stargazeCollections.find(
                                    (collection) => collection?.name === value
                                  )
                                );
                                setSearchCollectionValue("");
                              }}
                            >
                              <div className="ml-2 pt-2">
                                <Listbox.Button className="max-w-64 relative mt-4 w-64 cursor-default rounded-lg bg-osmoverse-600 py-2 pl-4 pr-10 text-left shadow-md focus:outline-none focus-visible:border-osmoverse-300 focus-visible:ring-2 focus-visible:ring-white-full focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-wosmongton-300 sm:w-full sm:text-sm">
                                  <input
                                    type="text"
                                    value={
                                      loadingCollections
                                        ? "Loading collections..."
                                        : searchCollectionValue
                                    }
                                    onChange={(e) =>
                                      setSearchCollectionValue(e.target.value)
                                    }
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                    className="w-full bg-transparent placeholder-osmoverse-200 outline-none"
                                    placeholder={
                                      selectedCollection?.name
                                        ? selectedCollection?.name
                                        : "Select a collection"
                                    }
                                  />
                                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                    <Icon
                                      className="flex shrink-0 items-center text-white-full"
                                      id={"chevron-down"}
                                      height={12}
                                      width={12}
                                    />
                                  </span>
                                </Listbox.Button>
                                <Listbox.Options className="no-scrollbar relative mt-1 max-h-64 w-64 overflow-auto rounded-md bg-osmoverse-600 text-base shadow-lg ring-1 ring-black ring-opacity-50 focus:outline-none sm:w-full sm:text-sm">
                                  {sortedFilteredCollections?.length === 0 && (
                                    <Listbox.Option
                                      className={({ active }) =>
                                        `relative m-1 ml-1 cursor-default select-none rounded-lg py-1 ${
                                          active
                                            ? "bg-osmoverse-800 text-white-full"
                                            : "text-osmoverse-300"
                                        }`
                                      }
                                      key={"no-collections-found"}
                                      value={"No collections found."}
                                    >
                                      <div className="text-center">
                                        <p className="subtitle1 tracking-wide text-osmoverse-300">
                                          {"No collections found."}
                                        </p>
                                      </div>
                                    </Listbox.Option>
                                  )}
                                  {sortedFilteredCollections?.map(
                                    (collection) => (
                                      <Listbox.Option
                                        className={({ active }) =>
                                          `my-1 mx-2 flex cursor-default select-none items-center justify-center rounded-md py-1 ${
                                            active
                                              ? "bg-osmoverse-800 text-white-full"
                                              : "text-osmoverse-300"
                                          }`
                                        }
                                        key={collection.name}
                                        value={collection.name}
                                      >
                                        <div className="text-center">
                                          <p className="subtitle1 tracking-wide text-osmoverse-300">
                                            {collection.name}
                                          </p>
                                        </div>
                                      </Listbox.Option>
                                    )
                                  )}
                                </Listbox.Options>
                              </div>
                            </Listbox>
                            {loadingNFTs ? (
                              <div className="relative mt-8 text-osmoverse-300">
                                {" "}
                                Loading tokens...{" "}
                              </div>
                            ) : (
                              <div className="relative mt-2 flex flex-col pr-4">
                                {((searchTokenValue.length > 0 &&
                                  filteredTokens.length >= 0) ||
                                  (searchTokenValue.length === 0 &&
                                    tokensWithImage.length > 0)) && (
                                  <div className="max-w-64 relative mt-4 w-full cursor-default rounded-lg bg-osmoverse-600 py-2 pl-4 pr-10 text-left shadow-md focus:outline-none focus-visible:border-osmoverse-300 focus-visible:ring-2 focus-visible:ring-white-full focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-wosmongton-300 sm:w-full sm:text-sm">
                                    <input
                                      type="text"
                                      value={searchTokenValue}
                                      onChange={(e) =>
                                        setSearchTokenValue(e.target.value)
                                      }
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                      }}
                                      className="w-full bg-transparent placeholder-osmoverse-200 outline-none"
                                      placeholder={
                                        selectedCollection?.name === "Badges"
                                          ? "Type to search for a badge"
                                          : "Type to search for a token"
                                      }
                                    />
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                      <Icon
                                        className="flex shrink-0 items-center text-white-full"
                                        id={"search"}
                                        height={12}
                                        width={12}
                                      />
                                    </span>
                                  </div>
                                )}
                                {selectedCollection !== undefined &&
                                  searchTokenValue.length === 0 &&
                                  filteredTokens?.length >= 0 &&
                                  tokensWithImage.length === 0 && (
                                    <div className="mt-6 text-sm">
                                      No suitable token to be used as a PFP.
                                    </div>
                                  )}
                                {tokensWithImage.length > 0 && (
                                  <div className="mt-1 grid h-64 max-h-64 w-[340px] grid-cols-2 overflow-auto rounded-md border border-osmoverse-500 p-2 sm:w-full xs:grid-cols-1">
                                    {tokensWithImage.map((nft) => (
                                      <div
                                        key={
                                          nft?.media?.visualAssets?.md
                                            ?.staticUrl
                                        }
                                        className="text-center"
                                      >
                                        <StargazeAvatar
                                          isSelectable
                                          isSelected={
                                            profileStore.currentAvatar ===
                                            "stargaze-pfp"
                                          }
                                          customurl={
                                            nft?.media?.visualAssets?.md
                                              ?.staticUrl
                                          }
                                          onSelect={() => {
                                            onCloseStargazePfpSelect();
                                            setSearchTokenValue("");
                                            logEvent([
                                              EventName.ProfileModal
                                                .selectAvatarClicked,
                                              { avatar: "stargaze-pfp" },
                                            ]);
                                            profileStore.setCurrentAvatar(
                                              "stargaze-pfp"
                                            );
                                            profileStore.setStargazeAvatarUri(
                                              nft?.media?.visualAssets?.md
                                                ?.staticUrl
                                            );
                                          }}
                                          className="outline-none sm:w-full"
                                        />
                                        <p className="subtitle1 mb-2 tracking-wide text-osmoverse-300">
                                          {nft?.name}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </DrawerPanel>
                      </DrawerContent>
                    </Drawer>
                  </div>
                </div>
              </DrawerPanel>
            </DrawerContent>
          </Drawer>

          <div className="mt-3 text-center">
            <p className="subtitle1" title={props?.icnsName}>
              {Boolean(props.icnsName)
                ? formatICNSName(props.icnsName, width < 768 ? 32 : 48)
                : getShortAddress(address)}
            </p>
          </div>

          <div className="mt-7 flex w-full justify-between rounded-[20px] border border-osmoverse-700 bg-osmoverse-800 p-5 xs:flex-col">
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
                    priceStore.calculatePrice(
                      navBarStore.walletInfo.balance,
                      priceStore.defaultVsCurrency
                    ) ??
                      new PricePretty(
                        priceStore.getFiatCurrency(
                          priceStore.defaultVsCurrency
                        )!,
                        new Dec(0)
                      ),
                    {
                      minimumFractionDigits: 2,
                      maximumSignificantDigits: undefined,
                      notation: "standard",
                    }
                  )}
                </h6>
                <p className="text-h5 font-h5">
                  {formatPretty(navBarStore.walletInfo.balance, {
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
                  onOpenFiatOnrampSelection();
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

              <Link href="/assets" passHref legacyBehavior>
                <ArrowButton isLink>{t("profile.viewAllAssets")}</ArrowButton>
              </Link>
            </div>
          </div>

          <div className="mt-5 flex w-full flex-col gap-[30px] rounded-[20px] border border-osmoverse-700 bg-osmoverse-800 p-5">
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
                    src={navBarStore.walletInfo.logoUrl}
                    height={48}
                    width={48}
                  />
                </div>

                <div className="subtitle-1 tracking-wide">
                  <p>Cosmos</p>
                  <div className="flex items-center gap-2">
                    <p title={address} className="text-osmoverse-100">
                      {getShortAddress(address)}
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
                          {getShortAddress(address, { prefixLength: 10 })}
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
        </div>
      </ModalBase>
      <FiatOnrampSelectionModal
        isOpen={isFiatOnrampSelectionOpen}
        onRequestClose={onCloseFiatOnrampSelection}
        onSelectRamp={(ramp) => {
          if (ramp !== "transak") return;
          const fiatValue = priceStore.calculatePrice(
            navBarStore.walletInfo.balance,
            priceStore.defaultVsCurrency
          );
          const coinValue = navBarStore.walletInfo.balance;

          logEvent([
            EventName.ProfileModal.buyTokensClicked,
            {
              tokenName: "OSMO",
              tokenAmount: Number(
                (fiatValue ?? coinValue)?.maxDecimals(4).toString()
              ),
            },
          ]);
        }}
      />
    </>
  );
});

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
    customurl?: string;
  }
>(({ isSelectable, isSelected, ...props }, ref) => {
  return (
    <button
      {...props}
      ref={ref}
      className={classNames(
        "h-[140px] w-[140px] overflow-hidden rounded-lg",
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

const SelectStargazePFP = forwardRef<
  any,
  HTMLAttributes<HTMLButtonElement> & {
    isSelectable?: boolean;
    isSelected?: boolean;
    onSelect?: () => void;
    customurl?: string;
  }
>(({ isSelectable, isSelected, ...props }, ref) => {
  return (
    <button
      {...props}
      ref={ref}
      className={classNames(
        "h-[140px] w-[140px] overflow-hidden rounded-[40px]",
        {
          "group transition-all duration-300 ease-in-out": isSelectable,
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
            "hover:bg-[linear-gradient(139.12deg,#9044F2_7.8%,#6BFFFF_88.54%)] hover:shadow-[0px_0px_20px_4px_#60ADD3] focus:bg-[linear-gradient(139.12deg,#9044F2_7.8%,#6BFFFF_88.54%)]",
          props.className
        )}
      >
        <Image
          alt="Ammelia profile avatar"
          src="/images/profile-ammelia.png"
          width={140}
          height={140}
        />
      </BaseAvatar>
    );
  }
);

const StargazeAvatar = forwardRef<any, ComponentProps<typeof BaseAvatar>>(
  (props, ref) => {
    return (
      <BaseAvatar
        {...props}
        ref={ref}
        className={classNames(
          "bg-transparent sm:w-full",
          props.isSelectable &&
            "hover:bg-[linear-gradient(139.12deg,#F35DC7_7.8%,#7B0DE2_88.54%)] hover:shadow-[0px_4px_20px_4px_#AA4990] focus:bg-[linear-gradient(139.12deg,#F35DC7_7.8%,#7B0DE2_88.54%)]",
          props.className
        )}
      >
        <img
          alt="Stargaze PFP preview"
          src={
            props.customurl ? props.customurl : "/images/profile-stargaze.png"
          }
          width={140}
          height={140}
        />
      </BaseAvatar>
    );
  }
);

const SelectNewAvatar = forwardRef<any, ComponentProps<typeof BaseAvatar>>(
  (props, ref) => {
    return (
      <SelectStargazePFP
        {...props}
        ref={ref}
        className={classNames("bg-transparent", props.className)}
      >
        <img
          alt="Select New Avatar"
          src={"/images/profile-stargaze.png"}
          width={140}
          height={140}
        />
      </SelectStargazePFP>
    );
  }
);
