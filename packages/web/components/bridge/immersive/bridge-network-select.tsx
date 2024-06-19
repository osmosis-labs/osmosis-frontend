import { debounce } from "debounce";
import React, { useMemo, useState } from "react";

import { SearchBox } from "~/components/input";
import { Intersection } from "~/components/intersection";
import { SkeletonLoader, Spinner } from "~/components/loaders";
import { ModalBase, ModalBaseProps } from "~/modals";
import { api } from "~/utils/trpc";

export const BridgeNetworkSelect = (modalProps: ModalBaseProps) => {
  const [query, setQuery] = useState("");
  const { data, hasNextPage, isLoading, isFetchingNextPage, fetchNextPage } =
    api.edge.chains.getChains.useInfiniteQuery(
      {
        limit: 50,
        search: query,
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
    () => data?.pages.flatMap((page) => page?.items) ?? [],
    [data]
  );
  const canLoadMore = !isLoading && !isFetchingNextPage && hasNextPage;

  return (
    <ModalBase
      title="Select network"
      className="!max-w-[30rem]"
      {...modalProps}
    >
      {/* TODO: Add translation */}
      <SearchBox
        onInput={debounce((nextValue) => {
          setQuery(nextValue);
        }, 300)}
        className="my-4 flex-shrink-0"
        placeholder="Search supported networks"
        size="full"
      />
      <div className="flex flex-col gap-1">
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
                className="subtitle1 flex items-center justify-between rounded-2xl px-4 py-4 transition-colors duration-200 hover:bg-osmoverse-700/50"
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
