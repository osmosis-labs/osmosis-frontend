import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";

import { ShowMoreButton } from "~/components/buttons/show-more";
import { MyPositionCard } from "~/components/cards";
import { useWalletSelect } from "~/hooks";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { Spinner } from "../loaders";

const INITIAL_POSITION_CNT = 3;

/** List of position cards for a user. Optionally show positions only for a give pool ID via `forPoolId` prop. */
export const MyPositionsSection: FunctionComponent<{ forPoolId?: string }> =
  observer(({ forPoolId }) => {
    const { accountStore, chainStore } = useStore();
    const { chainId } = chainStore.osmosis;
    const account = accountStore.getWallet(chainId);
    const { isLoading: isWalletLoading } = useWalletSelect();
    const [viewMore, setViewMore] = useState(false);

    const { data: positions, isLoading } =
      api.edge.concentratedLiquidity.getUserPositions.useQuery(
        {
          userOsmoAddress: account?.address ?? "",
        },
        {
          enabled: Boolean(account?.address) && !isWalletLoading,

          // expensive query
          trpc: {
            context: {
              skipBatch: true,
            },
          },
        }
      );

    const visiblePositions = (positions ?? []).slice(
      0,
      viewMore ? undefined : INITIAL_POSITION_CNT
    );

    if (!isLoading && positions && !positions.length) return null;

    return (
      <div className="flex flex-col gap-3">
        {isLoading && <Spinner className="mx-auto my-3" />}
        {visiblePositions.map((position) => (
          <MyPositionCard
            key={position.id}
            position={position}
            showLinkToPool={!Boolean(forPoolId)}
          />
        ))}
        {positions &&
          visiblePositions.length > 0 &&
          positions.length > INITIAL_POSITION_CNT && (
            <ShowMoreButton
              className="mx-auto"
              isOn={viewMore}
              onToggle={() => setViewMore((v) => !v)}
            />
          )}
      </div>
    );
  });
