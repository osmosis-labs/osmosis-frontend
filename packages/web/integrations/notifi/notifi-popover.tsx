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
import IconButton from "~/components/buttons/icon-button";
import { Popover } from "~/components/popover";
import { Button } from "~/components/ui/button";
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
      {/* @ts-ignore */}
      <IconButton
        ref={ref}
        aria-label="Open Notifications dropdown"
        icon={<Icon id="bell" width={24} height={24} />}
        {...buttonProps}
      />
      {hasUnreadNotification ? (
        <div className="pointer-events-none absolute bottom-[-0.375rem] right-[-0.375rem]">
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
                  <div
                    className={`relative mt-[1rem] h-[35.1875rem] 
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
