import { WalletStatus } from "@cosmos-kit/core";
import { useNotifiClientContext } from "@notifi-network/notifi-react-card";
import classNames from "classnames";
import React, {
  ComponentProps,
  ElementRef,
  Fragment,
  FunctionComponent,
  useRef,
} from "react";
import { forwardRef } from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import IconButton from "~/components/buttons/icon-button";
import { Popover } from "~/components/popover";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useWindowSize } from "~/hooks";
import { useNotifiBreadcrumb } from "~/integrations/notifi/hooks";
import { useNotifiModalContext } from "~/integrations/notifi/notifi-modal-context";
import { NotifiSubscriptionCard } from "~/integrations/notifi/notifi-subscription-card";
import { useStore } from "~/stores";

export interface NotifiButtonProps {
  className?: string;
}

const NotifiIconButton: FunctionComponent<
  ComponentProps<typeof Button> & { hasUnreadNotification?: boolean }
> = forwardRef(({ ...buttonProps }, ref) => {
  const { unreadNotificationCount, hasUnreadNotification } =
    useNotifiBreadcrumb();

  return (
    <>
      <IconButton
        ref={ref}
        aria-label="Open Notifications dropdown"
        icon={<Icon id="bell" width={24} height={24} />}
        {...buttonProps}
      />

      {hasUnreadNotification ? (
        <div className="absolute bottom-[-0.375rem] right-[-0.375rem]">
          <svg
            width="25"
            height="19"
            viewBox="0 0 25 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="0.5"
              y="0.5"
              width="24"
              height="18"
              rx="9"
              fill="#FA825D"
            />
          </svg>
          <div className="absolute top-0 bottom-0 left-[0.1rem] right-0 flex items-center justify-center text-caption">
            <div>
              {unreadNotificationCount > 99 ? "99" : unreadNotificationCount}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
});

export const NotifiPopover: FunctionComponent<NotifiButtonProps> = ({
  className,
}: NotifiButtonProps) => {
  const {
    chainStore: {
      osmosis: { chainId },
    },
    accountStore,
  } = useStore();
  const { logEvent } = useAmplitudeAnalytics();

  const osmosisWallet = accountStore.getWallet(chainId);

  const { client } = useNotifiClientContext();
  const {
    innerState: { onRequestBack, backIcon, title } = {},
    location,
    isInCardOverlayEnabled,
    isOverLayEnabled,
    setIsOverLayEnabled,
    setIsInCardOverlayEnabled,
    isPreventingCardClosed,
  } = useNotifiModalContext();

  const { isMobile } = useWindowSize();
  const notifiIconButtonRef = useRef<ElementRef<typeof NotifiIconButton>>(null);

  if (
    osmosisWallet?.walletStatus !== WalletStatus.Connected ||
    !client?.isInitialized ||
    isMobile
  ) {
    return (
      <div className="relative">
        <div className="absolute bottom-0 left-0 right-0 top-0 rounded-xl"></div>
        <NotifiIconButton className={className} disabled />
      </div>
    );
  }

  return (
    <>
      {isOverLayEnabled && (
        <div
          className="fixed bottom-0 left-0 right-0 top-0 z-[1] bg-osmoverse-1000 opacity-90"
          onClick={() => setIsOverLayEnabled(false)}
        ></div>
      )}
      <Popover className="relative z-[1]">
        {({ open: popOverOpen, close }) => {
          return (
            <>
              <Popover.Button as={Fragment}>
                <NotifiIconButton
                  ref={notifiIconButtonRef}
                  className={className}
                  onClick={() => {
                    if (isOverLayEnabled) setIsOverLayEnabled(false);
                    logEvent([EventName.Notifications.iconClicked]);
                  }}
                />
              </Popover.Button>
              {popOverOpen || isPreventingCardClosed ? (
                <Popover.Panel
                  static
                  className={classNames(
                    "absolute bottom-[-0.5rem] right-0 z-40",
                    `h-[40rem] w-[26.25rem]`,
                    "translate-y-full",
                    "overflow-hidden rounded-2xl bg-osmoverse-800 shadow-md"
                  )}
                >
                  {isInCardOverlayEnabled ? (
                    <div
                      className="fixed bottom-0 left-0 right-0 top-0 z-[2] bg-osmoverse-1000 opacity-90"
                      onClick={() => {
                        {
                          setIsInCardOverlayEnabled(false);
                          notifiIconButtonRef.current?.click(); // popoverOpen=true while inCardOverlay is clicked
                        }
                      }}
                    />
                  ) : null}

                  <div className="mt-[32px] flex place-content-between items-center py-[0.625rem]">
                    {onRequestBack && (
                      <IconButton
                        aria-label="Back"
                        mode="unstyled"
                        size="unstyled"
                        className={`top-9.5 absolute ${
                          backIcon !== "setting" ? "left" : "right"
                        }-8 z-2 mt-1 w-fit rotate-180 cursor-pointer py-0 text-osmoverse-400 transition-all duration-[0.5s] hover:text-osmoverse-200 md:left-7 md:top-7`}
                        icon={
                          <Icon
                            id={backIcon ?? "arrow-right"}
                            width={23}
                            height={23}
                          />
                        }
                        onClick={onRequestBack}
                      />
                    )}
                    {typeof title === "string" ? (
                      <div className="relative mx-auto">
                        <h6>{title}</h6>
                      </div>
                    ) : (
                      <>{title}</>
                    )}
                  </div>
                  <div
                    className={`relative mt-[1rem] h-[35.1875rem] ${
                      location !== "signup" ? "overflow-scroll" : ""
                    }
          pb-0`}
                  >
                    <NotifiSubscriptionCard
                      isPopoverOrModalBaseOpen={popOverOpen ? true : false}
                      closeCard={close}
                    />
                  </div>
                </Popover.Panel>
              ) : null}
            </>
          );
        }}
      </Popover>
    </>
  );
};
