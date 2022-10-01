import Image from "next/image";
import React, { FunctionComponent, useCallback } from "react";
import { useBooleanWithWindowEvent } from "../../../hooks";
import { MenuDropdown, MenuOption } from "../../control";
import { BaseCell } from "..";
import { PoolCompositionCell } from "./pool-composition";

export interface PoolQuickActionCell
  extends BaseCell,
    Pick<PoolCompositionCell, "poolId"> {
  onAddLiquidity: (poolId: string) => void;
  onRemoveLiquidity: (poolId: string) => void;
  onLockTokens: (poolId: string) => void;
}

/** Displays pool composition as a cell in a table.
 *
 *  Accepts the base hover flag.
 */
export const PoolQuickActionCell: FunctionComponent<
  Partial<PoolQuickActionCell>
> = ({ poolId, onAddLiquidity, onRemoveLiquidity, onLockTokens }) => {
  const [dropdownOpen, setDropdownOpen] = useBooleanWithWindowEvent(false);

  const menuOptions: MenuOption[] = [
    {
      id: "add-liquidity",
      display: "Add liquidity",
    },
    {
      id: "remove-liquidity",
      display: "Remove liquidity",
    },
    { id: "lock-tokens", display: "Lock Tokens" },
  ];

  const doAction = useCallback(
    (optionId) => {
      if (poolId) {
        switch (optionId) {
          case "add-liquidity":
            onAddLiquidity?.(poolId);
            break;
          case "remove-liquidity":
            onRemoveLiquidity?.(poolId);
            break;
          case "lock-tokeths":
            onLockTokens?.(poolId);
            break;
        }
      }
    },
    [poolId, onAddLiquidity, onRemoveLiquidity, onLockTokens]
  );

  return (
    <div
      className="flex items-center"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div
        className="absolute hover:pointer-cursor"
        onClick={(e) => {
          setDropdownOpen(true);
          e.preventDefault();
        }}
      >
        <Image alt="menu" src="/icons/more-menu.svg" width={24} height={24} />
        <MenuDropdown
          className="top-0 right-0"
          isOpen={dropdownOpen}
          options={menuOptions}
          onSelect={doAction}
          isFloating
        />
      </div>
    </div>
  );
};
