import React, { FunctionComponent, useMemo, useState } from "react";
import Image from "next/image";
import { AppCurrency } from "@keplr-wallet/types";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import classNames from "classnames";

/**
 * TokenSelect's dropdown is attached to the nearest "relative" element.
 */
export const TokenSelect: FunctionComponent<{
  containerClassName?: string;
  dropdownContainerClassName?: string;

  currency: AppCurrency;
  // Pass this prop with memorization.
  currencies: (AppCurrency & {
    // meta is used to pass the additional data to search token.
    meta?: string[];
  })[];
  onSelect: (currency: AppCurrency) => void;
}> = observer(
  ({
    containerClassName,
    dropdownContainerClassName,
    currency,
    currencies,
    onSelect,
  }) => {
    const { chainStore, queriesStore, accountStore } = useStore();

    const account = accountStore.getAccount(chainStore.osmosis.chainId);
    const queries = queriesStore.get(chainStore.osmosis.chainId);

    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [searchText, setSearchText] = useState("");

    const sortedCurrencies = useMemo(() => {
      return currencies.sort((cur1, cur2) => {
        if (
          chainStore.osmosis.stakeCurrency.coinMinimalDenom ===
          cur1.coinMinimalDenom
        ) {
          return -1;
        }
        if (
          chainStore.osmosis.stakeCurrency.coinMinimalDenom ===
          cur2.coinMinimalDenom
        ) {
          return 1;
        }

        const cur1IsIBCToken = "paths" in cur1;
        const cur2IsIBCToken = "paths" in cur2;

        if (!cur1IsIBCToken || !cur2IsIBCToken) {
          return cur1IsIBCToken ? 1 : -1;
        }

        return cur1.coinDenom > cur2.coinDenom ? 1 : -1;
      });
    }, [chainStore.osmosis.stakeCurrency.coinMinimalDenom, currencies]);

    const finalCurrencies = sortedCurrencies.filter((cur) => {
      if (cur.coinMinimalDenom === currency.coinMinimalDenom) {
        return false;
      }

      if (searchText) {
        return (
          cur.coinDenom.toLowerCase().includes(searchText.toLowerCase()) ||
          (cur.meta &&
            cur.meta.find((m) =>
              m.toLowerCase().includes(searchText.toLowerCase())
            ) != null)
        );
      } else {
        return true;
      }
    });

    return (
      <div
        className={classNames(
          "flex justify-center items-center",
          containerClassName
        )}
      >
        <div
          className={classNames("flex items-center group", {
            "cursor-pointer": finalCurrencies.length > 0,
          })}
          onClick={() => {
            if (finalCurrencies.length > 0) {
              if (isSelectOpen) {
                setSearchText("");
              }
              setIsSelectOpen((value) => !value);
            }
          }}
        >
          <div className="w-14 h-14 rounded-full border border-enabledGold flex items-center justify-center shrink-0 mr-3">
            <div className="w-11 h-11 rounded-full">
              <Image
                src={
                  currency.coinImageUrl
                    ? currency.coinImageUrl
                    : "/icons/OSMO.svg"
                }
                alt={`${currency.coinDenom} icon`}
                className="rounded-full"
                width={44}
                height={44}
              />
            </div>
          </div>
          <h5 className="text-white-full">{currency.coinDenom}</h5>
          {finalCurrencies.length > 0 ? (
            <div className="w-5 ml-3 pb-1">
              <Image
                className={`opacity-40 group-hover:opacity-100 transition-transform duration-100 ${
                  isSelectOpen ? "rotate-180" : "rotate-0"
                }`}
                src="/icons/chevron-down.svg"
                alt="select icon"
                width={20}
                height={8}
              />
            </div>
          ) : null}
        </div>

        {isSelectOpen && (
          <div
            className={classNames(
              "absolute bottom-0 translate-y-full p-3.5 bg-surface rounded-b-2xl z-10 w-full left-0",
              dropdownContainerClassName
            )}
          >
            <div className="flex items-center h-9 pl-4 mb-3 rounded-2xl bg-card">
              <div className="w-[1.125rem] h-[1.125rem]">
                <Image
                  src="/icons/search.svg"
                  alt="search"
                  width={18}
                  height={18}
                />
              </div>
              <input
                type="text"
                className="flex-1 px-4 subtitle2 text-white-full bg-transparent font-normal"
                placeholder="Search your token"
                value={searchText}
                onChange={(e) => {
                  e.preventDefault();

                  setSearchText(e.target.value);
                }}
              />
            </div>

            <div className="max-h-[20rem] overflow-y-auto">
              {finalCurrencies.map((currency) => {
                return (
                  <div
                    key={currency.coinMinimalDenom}
                    className="token-item-list overflow-x-auto cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();

                      setSearchText("");
                      setIsSelectOpen(false);
                      onSelect(currency);
                    }}
                  >
                    <div className="flex justify-between items-center rounded-2xl py-2.5 px-3 my-1 hover:bg-card cursor-pointer mr-3">
                      <div className="flex items-center">
                        <div className="w-9 h-9 rounded-full mr-3">
                          <Image
                            src={
                              currency.coinImageUrl
                                ? currency.coinImageUrl
                                : "/icons/OSMO.svg"
                            }
                            alt={`${currency.coinDenom} icon`}
                            className="rounded-full"
                            width={36}
                            height={36}
                          />
                        </div>
                        <div>
                          <h6 className="text-white-full">
                            {currency.coinDenom}
                          </h6>
                          {"paths" in currency && currency.paths.length > 0 ? (
                            <div className="text-iconDefault text-sm font-semibold">
                              {currency.paths[0].channelId}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <h6 className="text-white-full">
                        {queries.queryBalances
                          .getQueryBech32Address(account.bech32Address)
                          .getBalanceFromCurrency(currency)
                          .trim(true)
                          .shrink(true)
                          .maxDecimals(6)
                          .hideDenom(true)
                          .toString()}
                      </h6>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
);
