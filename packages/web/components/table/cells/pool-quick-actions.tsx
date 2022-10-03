import Image from "next/image";
import React, { FunctionComponent, useCallback, useMemo } from "react";
import { useBooleanWithWindowEvent } from "../../../hooks";
import { MenuDropdown, MenuOption } from "../../control";
import { BaseCell } from "..";
import { PoolCompositionCell } from "./pool-composition";

export interface PoolQuickActionCell
  extends BaseCell,
    Pick<PoolCompositionCell, "poolId"> {
  onAddLiquidity?: () => void;
  onRemoveLiquidity?: () => void;
  onLockTokens?: () => void;
}

/** Displays pool composition as a cell in a table.
 *
 *  Accepts the base hover flag.
 */
export const PoolQuickActionCell: FunctionComponent<
  Partial<PoolQuickActionCell>
> = ({ poolId, onAddLiquidity, onRemoveLiquidity, onLockTokens }) => {
  const [dropdownOpen, setDropdownOpen] = useBooleanWithWindowEvent(false);

  const menuOptions = useMemo(() => {
    const m: MenuOption[] = [];

    if (onAddLiquidity) {
      m.push({
        id: "add-liquidity",
        display: "Add liquidity",
      });
    }
    if (onRemoveLiquidity) {
      m.push({
        id: "remove-liquidity",
        display: "Remove liquidity",
      });
    }
    if (onLockTokens) {
      m.push({ id: "lock-tokens", display: "Lock Tokens" });
    }

    return m;
  }, [onAddLiquidity, onRemoveLiquidity, onLockTokens]);

  const doAction = useCallback(
    (optionId) => {
      setDropdownOpen(false);

      switch (optionId) {
        case "add-liquidity":
          onAddLiquidity?.();
          break;
        case "remove-liquidity":
          onRemoveLiquidity?.();
          break;
        case "lock-tokens":
          onLockTokens?.();
          break;
      }
    },
    [poolId, onAddLiquidity, onRemoveLiquidity, onLockTokens, setDropdownOpen]
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
          className="w-40 top-0 right-0"
          isOpen={dropdownOpen}
          options={menuOptions}
          onSelect={(id) => doAction(id)}
          isFloating
        />
      </div>
    </div>
  );
};
