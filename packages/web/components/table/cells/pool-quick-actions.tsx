import EventEmitter from "eventemitter3";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
} from "react";

import { MenuDropdown, MenuOption } from "~/components//control";
import { Icon } from "~/components/assets";
import { BaseCell } from "~/components/table";
import { PoolCompositionCell } from "~/components/table/cells/pool-composition";
import { useTranslation } from "~/hooks";
import { useBooleanWithWindowEvent } from "~/hooks";

export interface PoolQuickActionCell
  extends BaseCell,
    Pick<PoolCompositionCell, "poolId"> {
  /** Used to group quick action cells, to close dropdowns via events aren't related to this cell. */
  cellGroupEventEmitter?: EventEmitter;
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
> = ({
  poolId,
  cellGroupEventEmitter,
  onAddLiquidity,
  onRemoveLiquidity,
  onLockTokens,
}) => {
  const [dropdownOpen, setDropdownOpen] = useBooleanWithWindowEvent(false);
  const { t } = useTranslation();

  const menuOptions = useMemo(() => {
    const m: MenuOption[] = [];

    if (onAddLiquidity) {
      m.push({
        id: "add-liquidity",
        display: t("addLiquidity.title"),
      });
    }
    if (onRemoveLiquidity) {
      m.push({
        id: "remove-liquidity",
        display: t("removeLiquidity.title"),
      });
    }
    if (onLockTokens) {
      m.push({
        id: "lock-tokens",
        display: t("lockToken.title"),
      });
    }

    return m;
  }, [onAddLiquidity, onRemoveLiquidity, onLockTokens, t]);

  const doAction = useCallback(
    (optionId: string) => {
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
    [onAddLiquidity, onRemoveLiquidity, onLockTokens, setDropdownOpen]
  );

  useEffect(() => {
    if (cellGroupEventEmitter) {
      const onPoolSelected = (selectedPoolId: string) => {
        if (selectedPoolId !== poolId) {
          setDropdownOpen(false);
        }
      };
      cellGroupEventEmitter.on("select-pool-id", onPoolSelected);

      return () => {
        cellGroupEventEmitter.removeListener("select-pool-id", onPoolSelected);
      };
    }
  }, [cellGroupEventEmitter, poolId, setDropdownOpen]);

  return (
    <div
      className="flex items-center"
      onClick={(e) => {
        e.stopPropagation();
        setDropdownOpen(!dropdownOpen);
        cellGroupEventEmitter?.emit("select-pool-id", poolId);
      }}
    >
      <div
        className="hover:pointer-cursor relative"
        onClick={(e) => {
          e.preventDefault();
        }}
      >
        <Icon id="more-menu" className="h-6 w-6" />
        <MenuDropdown
          className="right-0 top-full w-44"
          isOpen={dropdownOpen}
          options={menuOptions}
          onSelect={(id) => doAction(id)}
          isFloating
        />
      </div>
    </div>
  );
};
