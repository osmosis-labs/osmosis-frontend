import React, { useMemo, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import CaretDown from "~/components/assets/caret-down";
import LinkIconButton from "~/components/buttons/link-icon-button";

const TEXT_CHAR_LIMIT = 450;

interface TokenDetailsProps {
  denom: string;
}

function TokenDetails({ denom }: TokenDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslation();
  const text = `Osmosis is a decentralized exchange (DEX) that uses the Cosmos SDK for optimized functionality with other blockchains. Its automated market makers set it apart, allowing enhanced market responsiveness for liquidity providers.\n\nOsmosis is a multi-chain DEX specifically built to function with other blockchains in the Cosmos ecosystem. Communication withthese other blockchains is achieved via its Inter-Blockchain Communication protocol (IBC). Because Osmosis is linked to other Tendermint blockchains, providing smooth, fast trades.`;

  const isExpandable = useMemo(() => text.length > TEXT_CHAR_LIMIT, [text]);

  const expandedText = useMemo(() => {
    if (isExpandable && !isExpanded) {
      return text.substring(0, TEXT_CHAR_LIMIT);
    }

    return text;
  }, [isExpandable, isExpanded, text]);

  return (
    <div className="flex flex-col items-start gap-3 self-stretch rounded-5xl border border-osmoverse-800 bg-osmoverse-900 p-10 xl:gap-6 md:p-6 1.5xs:gap-6">
      <TokenStats />
      <div className="flex flex-col items-start self-stretch">
        <div className="flex flex-col items-start gap-4.5 self-stretch 1.5xs:gap-6">
          <div className="flex items-center gap-8 1.5xs:flex-col 1.5xs:gap-4">
            <h6 className="text-lg font-h6 leading-6 text-osmoverse-100">
              {t("tokenInfos.aboutDenom", { denom })}
            </h6>
            <div className="flex items-center gap-2">
              <LinkIconButton
                href="/"
                mode="icon-social"
                size="md-icon-social"
                aria-label={t("tokenInfos.ariaViewOn", { name: "X" })}
                icon={<Icon className="h-4 w-4 text-osmoverse-400" id="X" />}
              />
              <LinkIconButton
                href="/"
                mode="icon-social"
                size="md-icon-social"
                aria-label={t("tokenInfos.ariaView", { name: "website" })}
                icon={<Icon className="h-6 w-6 text-osmoverse-400" id="web" />}
              />
              <LinkIconButton
                href="/"
                mode="icon-social"
                size="md-icon-social"
                aria-label={t("tokenInfos.ariaViewOn", { name: "CoinGecko" })}
                icon={
                  <Icon
                    className="h-10.5 w-10.5 text-osmoverse-300"
                    id="coingecko"
                  />
                }
              />
            </div>
          </div>
          <div
            className={`${
              !isExpanded && isExpandable && "tokendetailshadow"
            } relative self-stretch`}
          >
            <p className="breakspaces font-base self-stretch font-subtitle1 text-osmoverse-200 transition-all">
              {expandedText}
            </p>
            {isExpandable && (
              <button
                className={`${
                  !isExpanded && "bottom-0"
                } absolute z-10 flex items-center gap-1 self-stretch`}
                onClick={() => setIsExpanded((v) => !v)}
              >
                <p className="font-base leading-6 text-wosmongton-300">
                  {isExpanded
                    ? t("tokenInfos.collapse")
                    : t("components.show.more")}
                </p>
                <div className={`${isExpanded && "rotate-180"}`}>
                  <CaretDown className="fill-wosmongton-300" />
                </div>
              </button>
            )}
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
