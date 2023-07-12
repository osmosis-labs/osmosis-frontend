import { useNotifiSubscriptionContext } from "@notifi-network/notifi-react-card";
import classNames from "classnames";
import React, {
  ComponentProps,
  Fragment,
  FunctionComponent,
  useRef,
} from "react";

import { useStore } from "~/stores";

import { Icon } from "../assets";
import { Button } from "../buttons";
import IconButton from "../buttons/icon-button";
import { Popover } from "../popover";
import { useNotifiModalContext } from "./notifi-modal-context";
import { NotifiSubscriptionCard } from "./notifi-subscription-card";

export interface NotifiButtonProps {
  className?: string;
}

const NotifiIconButton: FunctionComponent<ComponentProps<typeof Button>> = (
  props
) => {
  return (
    <IconButton
      aria-label="Open Notifications dropdown"
      icon={<Icon id="bell" width={24} height={24} />}
      {...props}
    />
  );
};

export const NotifiPopover: FunctionComponent<NotifiButtonProps> = ({
  className,
}: NotifiButtonProps) => {
  const {
    chainStore: {
      osmosis: { chainId },
    },
    accountStore,
  } = useStore();

  const cardRef = useRef<HTMLDivElement>(null);

  const {
    innerState: { onRequestBack, backIcon, title } = {},
    isOverLayEnabled,
    setIsOverLayEnabled,
  } = useNotifiModalContext();

  const { cardView } = useNotifiSubscriptionContext();

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
        {/* <div className="absolute left-[-1rem] w-screen bg-osmoverse-100 opacity-30">GG</div> */}
        <Popover.Button as={Fragment}>
          <NotifiIconButton className={className} />
        </Popover.Button>
        <Popover.Panel
          className={classNames(
            "absolute bottom-[-0.5rem] right-[-10rem] z-40",
            `${
              cardView?.state === "signup" ? "h-[14.5rem]" : "h-[42.5rem]"
            } w-[27.5rem]`,
            "translate-y-full",
            "rounded-2xl bg-osmoverse-800 shadow-md",
            "flex flex-col overflow-y-auto"
          )}
        >
          <div className="mt-2 mb-4 flex place-content-between items-center pt-3 md:pt-5">
            {onRequestBack && (
              <IconButton
                aria-label="Back"
                mode="unstyled"
                size="unstyled"
                className={`top-9.5 absolute ${
                  backIcon !== "setting" ? "left" : "right"
                }-8 z-50 mt-1 w-fit rotate-180 cursor-pointer py-0 text-osmoverse-400 md:top-7 md:left-7`}
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
            {/* <IconButton
            aria-label="Back"
            mode="unstyled"
            size="unstyled"
            className="top-9.5 absolute right-8 z-50 w-fit cursor-pointer py-0 text-osmoverse-400 md:top-7 md:left-7"
            icon={<Icon id={backIcon ?? "chevron-left"} width={18} height={18} />}
            onClick={onRequestBack}
          /> */}
          </div>
          <div
            ref={cardRef}
            className={
              cardRef.current &&
              cardRef.current?.scrollHeight > cardRef.current?.offsetHeight
                ? "{overflow-scroll}"
                : ""
            }
          >
            <NotifiSubscriptionCard />
          </div>
        </Popover.Panel>
      </Popover>
    </>
  );
};
