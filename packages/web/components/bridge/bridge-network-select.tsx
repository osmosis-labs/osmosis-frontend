import React, { useMemo } from "react";

import { Intersection } from "~/components/intersection";
import { SkeletonLoader, Spinner } from "~/components/loaders";
import { ModalBase, ModalBaseProps } from "~/modals";
import { api } from "~/utils/trpc";

export const BridgeNetworkSelect = (modalProps: ModalBaseProps) => {
  const {
    data: chainsPages,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
  } = api.edge.chains.getChains.useInfiniteQuery(
    {
      limit: 50,
    },
    {
      enabled: modalProps.isOpen,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
      keepPreviousData: true,

      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const chains = useMemo(
    () => chainsPages?.pages.flatMap((page) => page?.items) ?? [],
    [chainsPages]
  );
  const canLoadMore = !isLoading && !isFetchingNextPage && hasNextPage;

  console.log(hasNextPage);

  return (
    <ModalBase
      title="More deposit options"
      className="!max-w-[30rem]"
      {...modalProps}
    >
      <div className="flex flex-col gap-1 pt-4">
        {isLoading ? (
          <>
            {new Array(3).fill(undefined).map((_, i) => (
              <SkeletonLoader key={i} className="h-[76px] w-full" />
            ))}
          </>
        ) : (
          <>
            {chains.map(({ chain_name, pretty_name }) => (
              <button
                key={chain_name}
                className="subtitle1 flex items-center justify-between rounded-2xl bg-osmoverse-700 px-4 py-4 transition-colors duration-200 hover:bg-osmoverse-700/50"
              >
                {pretty_name}
              </button>
            ))}
            <Intersection
              onVisible={() => {
                if (canLoadMore) {
                  fetchNextPage();
                }
              }}
            />
            {isFetchingNextPage && (
              <div className="self-center pt-3">
                <Spinner />
              </div>
            )}
          </>
        )}
      </div>
    </ModalBase>
  );
};
