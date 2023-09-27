import React, { useState } from "react";

import { Icon } from "~/components/assets";
import LinkIconButton from "~/components/buttons/link-icon-button";

const TEXT_CHAR_LIMIT = 485;

function TokenDetails() {
  const [isExpanded, setIsExpanded] = useState(false);
  const text = `Osmosis is a decentralized exchange (DEX) that uses the Cosmos SDK for optimized functionality with other blockchains. Its automated market makers set it apart, allowing enhanced market responsiveness for liquidity providers.\n\nOsmosis is a multi-chain DEX specifically built to function with other blockchains in the Cosmos ecosystem. Communication withthese other blockchains is achieved via its Inter-Blockchain Communication protocol (IBC). Because Osmosis is linked to other Tendermint blockchains, providing smooth, fast trades,`;

  return (
    <div className="flex flex-col items-start gap-3 self-stretch rounded-5xl border border-osmoverse-800 bg-osmoverse-900 p-10 xl:gap-6 1.5xs:gap-6">
      <TokenStats />
      <div className="flex flex-col items-start self-stretch">
        <div className="flex flex-col items-start gap-4.5 self-stretch 1.5xs:gap-6">
          <div className="flex items-center gap-8 1.5xs:flex-col 1.5xs:gap-4">
            <h6 className="text-lg font-h6 leading-6 text-osmoverse-100">
              About OSMO
            </h6>
            <div className="flex items-center gap-2">
              <LinkIconButton
                href="/"
                mode="icon-social"
                size="md-icon-social"
                aria-label="View on X"
                icon={
                  <Icon
                    className="h-[16px] w-[16px] text-osmoverse-400"
                    id="X"
                  />
                }
              />
              <LinkIconButton
                href="/"
                mode="icon-social"
                size="md-icon-social"
                aria-label="View website"
                icon={
                  <Icon
                    className="h-[24px] w-[24px] text-osmoverse-400"
                    id="web"
                  />
                }
              />
              <LinkIconButton
                href="/"
                mode="icon-social"
                size="md-icon-social"
                aria-label="View on CoinGecko"
                icon={
                  <Icon
                    className="h-[42px] w-[42px] text-osmoverse-300"
                    id="coingecko"
                  />
                }
              />
            </div>
          </div>
          <div
            className={`${!isExpanded && "aftershadow"} relative self-stretch`}
          >
            <p className="breakspaces font-base self-stretch font-subtitle1 text-osmoverse-200 transition-all">
              {isExpanded ? text : text.substring(0, TEXT_CHAR_LIMIT)}
            </p>
            <button
              className={`${
                !isExpanded && "bottom-0"
              } absolute z-10 flex items-center gap-1 self-stretch`}
              onClick={() => setIsExpanded((v) => !v)}
            >
              <p className="font-base leading-6 text-wosmongton-300">
                {isExpanded ? "Collapse" : "View more"}
              </p>
              <div className={`${isExpanded && "rotate-180"}`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M20.2959 9.79592L12.7959 17.2959C12.6914 17.4008 12.5672 17.484 12.4304 17.5408C12.2937 17.5976 12.1471 17.6268 11.999 17.6268C11.851 17.6268 11.7043 17.5976 11.5676 17.5408C11.4309 17.484 11.3067 17.4008 11.2021 17.2959L3.70215 9.79592C3.4908 9.58457 3.37207 9.29793 3.37207 8.99904C3.37207 8.70016 3.4908 8.41351 3.70215 8.20217C3.91349 7.99082 4.20014 7.87209 4.49902 7.87209C4.79791 7.87209 5.08455 7.99082 5.2959 8.20217L12 14.9062L18.704 8.20123C18.9154 7.98989 19.202 7.87115 19.5009 7.87115C19.7998 7.87115 20.0864 7.98989 20.2978 8.20123C20.5091 8.41258 20.6278 8.69922 20.6278 8.99811C20.6278 9.29699 20.5091 9.58364 20.2978 9.79498L20.2959 9.79592Z"
                    fill="#8C8AF9"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TokenDetails;

function TokenStats() {
  return (
    <div className="flex flex-col items-end gap-4.5 self-stretch">
      <div className="flex flex-wrap items-end gap-20 self-stretch 2xl:gap-y-6">
        <div className="flex flex-col items-start gap-3">
          <p className="text-base font-subtitle1 leading-6 text-osmoverse-300">
            Market cap rank
          </p>
          <h5 className="text-xl font-h5 leading-8">#68</h5>
        </div>
        <div className="flex flex-col items-start gap-3">
          <p className="text-base font-subtitle1 leading-6 text-osmoverse-300">
            Market cap
          </p>
          <h5 className="text-xl font-h5 leading-8">$413M USD</h5>
        </div>
        <div className="flex flex-col items-start gap-3">
          <p className="text-base font-subtitle1 leading-6 text-osmoverse-300">
            Circulating supply
          </p>
          <h5 className="text-xl font-h5 leading-8">640M</h5>
        </div>
        <div className="flex flex-col items-start gap-3">
          <p className="text-base font-subtitle1 leading-6 text-osmoverse-300">
            TVL
          </p>
          <h5 className="text-xl font-h5 leading-8">$145M</h5>
        </div>
      </div>
    </div>
  );
}
