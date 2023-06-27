import classNames from "classnames";
import React, { ComponentProps, Fragment, FunctionComponent } from "react";

import { useStore } from "~/stores";

import { Icon } from "../../components/assets";
import { Button } from "../../components/buttons";
import IconButton from "../../components/buttons/icon-button";
import { Popover } from "../../components/popover";
import { useNotifiModalContext } from "./notifi-modal-context";
import { NotifiSubscriptionCard } from "./notifi-subscription-card";

export interface NotifiButtonProps {
  className?: string;
  hasUnreadNotification: boolean;
}

const NotifiIconButton: FunctionComponent<
  ComponentProps<typeof Button> & { hasUnreadNotification?: boolean }
> = (props) => {
  return (
    <>
      <IconButton
        aria-label="Open Notifications dropdown"
        icon={<Icon id="bell" width={24} height={24} />}
        {...props}
      />
      {props.hasUnreadNotification ? (
        <div className="absolute bottom-[0.2875rem] right-[0.30125rem]">
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse
              cx="5.08333"
              cy="4.99998"
              rx="4.33333"
              ry="4.4"
              fill="#FA825D"
            />
          </svg>
        </div>
      ) : null}
    </>
  );
};

export const NotifiPopover: FunctionComponent<NotifiButtonProps> = ({
  className,
  hasUnreadNotification,
}: NotifiButtonProps) => {
  const {
    chainStore: {
      osmosis: { chainId },
    },
    accountStore,
  } = useStore();

  const {
    innerState: { onRequestBack, backIcon, title } = {},
    location,
    isOverLayEnabled,
    setIsOverLayEnabled,
  } = useNotifiModalContext();

  if (!accountStore.getWallet(chainId)) {
    return <NotifiIconButton className={className} disabled />;
  }

  return (
    <>
      {isOverLayEnabled && (
        <div
          className="fixed left-0 top-0 bottom-0 right-0 z-[1] bg-osmoverse-1000 opacity-90"
          onClick={() => setIsOverLayEnabled(false)}
        ></div>
      )}
      <Popover className="relative z-[1]">
        <Popover.Button as={Fragment}>
          <NotifiIconButton
            className={className}
            hasUnreadNotification={hasUnreadNotification}
          />
        </Popover.Button>
        <Popover.Panel
          className={classNames(
            "absolute bottom-[-0.5rem] right-0 z-40",
            `h-[40rem] w-[26.25rem]`,
            "translate-y-full",
            "overflow-hidden rounded-2xl bg-osmoverse-800 shadow-md"
          )}
        >
          <div className="mt-[32px] flex place-content-between items-center py-[0.625rem]">
            {onRequestBack && (
              <IconButton
                aria-label="Back"
                mode="unstyled"
                size="unstyled"
                className={`top-9.5 absolute ${
                  backIcon !== "setting" ? "left" : "right"
                }-8 z-50 mt-1 w-fit rotate-180 cursor-pointer py-0 text-osmoverse-400 transition-all duration-[0.5s] hover:text-osmoverse-200 md:top-7 md:left-7`}
                icon={
                  <Icon id={backIcon ?? "arrow-right"} width={23} height={23} />
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
            <NotifiSubscriptionCard />
          </div>
        </Popover.Panel>
      </Popover>
    </>
  );
};
