import classNames from "classnames";
import React from "react";

import { Icon } from "~/components/assets";
import { SpriteIconId } from "~/config";
import { theme } from "~/tailwind.config";

export const SmallTransactionContainer = ({
  status,
  title,
  leftComponent,
  rightComponent,
  isSelected,
  onClick,
}: {
  status: "pending" | "failed" | "success";
  title: { [key in "pending" | "failed" | "success"]: string };
  leftComponent: JSX.Element | null;
  rightComponent: JSX.Element | null;
  isSelected?: boolean;
  onClick?: () => void;
}) => (
  <div
    className={classNames(
      "-mx-2 flex justify-between gap-4 rounded-2xl p-2",
      // Highlight the selected transaction
      {
        "bg-osmoverse-825 transition-colors duration-100 ease-in-out":
          isSelected,
      },
      // Highlight the hovered transaction
      {
        "cursor-pointer hover:bg-osmoverse-850": Boolean(onClick),
      }
    )}
    onClick={() => onClick?.()}
  >
    <div className="flex flex-col">
      <p
        className={classNames(
          "body2",
          status === "failed" ? "text-rust-400" : "text-white-full"
        )}
      >
        {title[status]}
      </p>
      {leftComponent}
    </div>
    <div className="flex items-center justify-end">{rightComponent}</div>
  </div>
);

export const LargeTransactionContainer = ({
  iconId,
  status,
  title,
  rightComponent,
  isSelected,
  onClick,
  hash,
}: {
  iconId: SpriteIconId;
  status: "pending" | "failed" | "success";
  title: { [key in "pending" | "failed" | "success"]: string };
  rightComponent: JSX.Element | null;
  isSelected?: boolean;
  onClick?: () => void;
  hash?: string;
}) => (
  <div
    data-transaction-hash={hash}
    className={classNames(
      "-mx-4 flex justify-between items-center gap-4 rounded-2xl p-4 md:-mx-2 md:gap-2 md:rounded-lg md:p-2",
      // Highlight the selected transaction
      {
        "bg-osmoverse-825 transition-colors duration-100 ease-in-out":
          isSelected,
      },
      // Highlight the hovered transaction
      {
        "cursor-pointer hover:bg-osmoverse-850": Boolean(onClick),
      }
    )}
    onClick={() => onClick?.()}
  >
    <div className="flex w-1/3 items-center gap-4 md:w-1/2 md:gap-2">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-825 p-3 md:h-8 md:w-8 md:p-2">
        {status === "success" || status === "pending" ? (
          <Icon
            id={iconId}
            width="100%"
            height="100%"
            className="text-osmoverse-200"
          />
        ) : (
          <Icon
            width="100%"
            height="100%"
            id="alert-circle"
            color={theme.colors.rust[400]}
          />
        )}
      </div>

      <div>
        <p
          className={classNames(
            "subtitle1 md:body2 text-osmoverse-100",
            status === "failed" ? "text-rust-400" : "text-white-full"
          )}
        >
          {title[status]}
        </p>
      </div>
    </div>

    {rightComponent}
  </div>
);
