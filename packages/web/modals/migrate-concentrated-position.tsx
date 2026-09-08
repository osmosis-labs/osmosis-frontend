import type { UserPosition } from "@osmosis-labs/server";
import { Int } from "@osmosis-labs/unit";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useCallback, useState } from "react";

import { Icon } from "~/components/assets";
import {
  USDC_ALLOYED_DENOM,
  USDC_NOBLE_DENOM,
  USDC_TRANSMUTER_POOL_ID,
} from "~/config/position-migration";
import { useConnectWalletModalRedirect, useTranslation } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

/**
 * Moves a concentrated liquidity position to an equivalent pool, keeping the
 * same price range.
 *
 * The withdraw and the create share one transaction, so if the create cannot
 * be filled on acceptable terms the whole thing reverts and the original
 * position is left untouched. Whatever does not fit the new position's ratio
 * at the destination price is returned to the wallet rather than swapped.
 */
export const MigrateConcentratedPositionModal: FunctionComponent<
  {
    position: UserPosition;
    toPoolId: string;
    minAmountTolerance: number;
  } & ModalBaseProps
> = observer((props) => {
  const { position, toPoolId, minAmountTolerance } = props;
  const {
    id: positionId,
    poolId,
    position: { position: rawPosition },
  } = position;

  const { t } = useTranslation();
  const { chainStore, accountStore } = useStore();
  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);
  const apiUtils = api.useUtils();

  const [isMigrating, setIsMigrating] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const migrate = useCallback(async () => {
    if (!account) return;

    setIsMigrating(true);
    setError(undefined);

    try {
      await account.osmosis.sendMigrateConcentratedLiquidityPositionMsg(
        positionId,
        toPoolId,
        new Int(rawPosition.lower_tick),
        new Int(rawPosition.upper_tick),
        minAmountTolerance,
        {
          fromDenom: USDC_NOBLE_DENOM,
          toDenom: USDC_ALLOYED_DENOM,
          transmuterPoolId: USDC_TRANSMUTER_POOL_ID,
        },
        undefined,
        (tx) => {
          if (!tx.code) {
            // Both pools' tick data and the user's position list change.
            apiUtils.local.concentratedLiquidity.invalidate();
            props.onRequestClose();
          }
        }
      );
    } catch (e) {
      // Surfaced rather than only logged: a refusal here is the safety
      // mechanism working, and the user needs to know the position was not
      // moved.
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsMigrating(false);
    }
  }, [
    account,
    positionId,
    toPoolId,
    rawPosition.lower_tick,
    rawPosition.upper_tick,
    minAmountTolerance,
    apiUtils,
    props,
  ]);

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled: isMigrating || Boolean(account?.txTypeInProgress),
      onClick: migrate,
      children: t("clPositions.migrateLiquidity"),
    },
    props.onRequestClose
  );

  return (
    <ModalBase
      {...props}
      isOpen={props.isOpen && showModalBase}
      title={t("clPositions.migrateLiquidity")}
    >
      <div className="flex flex-col gap-6 pt-8">
        <div className="flex flex-col gap-3">
          <span className="body2 text-osmoverse-200">
            {t("clPositions.migrateDescription", {
              fromPoolId: poolId,
              toPoolId,
            })}
          </span>
          <span className="caption text-osmoverse-300">
            {t("clPositions.migrateReason")}
          </span>
          <span className="caption text-osmoverse-300">
            {t("clPositions.migrateDustNotice")}
          </span>
          <span className="caption text-osmoverse-300">
            {t("clPositions.migrateIncentivesNotice")}
          </span>
          <span className="caption text-osmoverse-300">
            {t("clPositions.migrateRiskNotice")}
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl bg-osmoverse-900 px-4 py-3">
            <Icon id="alert-circle" height={16} width={16} />
            <span className="caption text-rust-300">{error}</span>
          </div>
        )}

        {accountActionButton}
      </div>
    </ModalBase>
  );
});
