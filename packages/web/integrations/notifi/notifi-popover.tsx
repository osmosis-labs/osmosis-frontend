import classNames from "classnames";
import React, {
  ComponentProps,
  Fragment,
  FunctionComponent,
  useRef,
} from "react";

import { useStore } from "~/stores";

import { Icon } from "../../components/assets";
import { Button } from "../../components/buttons";
import IconButton from "../../components/buttons/icon-button";
import { Popover } from "../../components/popover";
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

  if (!accountStore.getWallet(chainId)) {
    return <NotifiIconButton className={className} disabled />;
  }

  return (
    <Popover className="relative">
      {isOverLayEnabled && (
        <div
          className="fixed left-0 top-0 bottom-0 right-0 z-[1] bg-osmoverse-1000 opacity-90"
          onClick={() => setIsOverLayEnabled(false)}
        ></div>
      )}
      <Popover.Button as={Fragment}>
        <NotifiIconButton className={className} />
      </Popover.Button>
      <Popover.Panel
        className={classNames(
          "absolute bottom-[-0.5rem] right-[-10rem] z-40",
          `h-[42.5rem] w-[27.5rem]`,
          "translate-y-full",
          "overflow-hidden rounded-2xl bg-osmoverse-800 shadow-md"
        )}
      >
        <div className="mt-[32px] flex place-content-between items-center py-[10px]">
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
        </div>
        <div
          ref={cardRef}
          className={`relative mt-[20px] h-[37.5rem] 
          overflow-scroll`}
        >
          <NotifiSubscriptionCard />
        </div>
      </Popover.Panel>
    </Popover>
    // </>
  );
};
