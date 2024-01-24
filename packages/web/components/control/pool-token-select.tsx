import classNames from "classnames";
import { FunctionComponent, useState } from "react";

import { Icon, PoolAssetInfo, Token } from "~/components/assets";
import { CustomClasses, MobileProps } from "~/components/types";

/** Used to select a token token from within a pool. */
export const PoolTokenSelect: FunctionComponent<
  {
    tokens: PoolAssetInfo[];
    selectedTokenDenom: string;
    onSelectToken: (tokenIndex: number) => void;
  } & CustomClasses &
    MobileProps
> = ({
  tokens,
  selectedTokenDenom,
  onSelectToken,
  className,
  isMobile = false,
}) => {
  const selectedToken = tokens.find(
    (token) => token.coinDenom === selectedTokenDenom
  );
  const tokenIndex = (denom: string) =>
    tokens.findIndex((token) => token.coinDenom === denom);
  let [isToggleOpen, setToggleOpen] = useState(false);

  if (!selectedToken) return null;

  return (
    <div>
      <div
        className={classNames(
          "flex cursor-pointer p-3 hover:bg-osmoverse-700 md:p-1",
          {
            "w-64 rounded-t-xl bg-osmoverse-700 md:w-48": isToggleOpen,
            "rounded-xl": !isToggleOpen,
          },
          className
        )}
      >
        <button
          className="relative flex items-center gap-3 md:gap-1.5"
          onClick={() => setToggleOpen(!isToggleOpen)}
        >
          <Token
            {...selectedToken}
            ringColorIndex={tokenIndex(selectedToken.coinDenom)}
            isMobile={isMobile}
          />
          <div
            className={classNames(
              "my-auto shrink-0 pt-1 text-osmoverse-400 transition",
              {
                "rotate-180": isToggleOpen,
              }
            )}
          >
            <Icon
              id="chevron-down"
              height={isMobile ? 15 : 20}
              width={isMobile ? 15 : 20}
            />
          </div>
        </button>
      </div>
      {isToggleOpen && (
        <TokensDropdown
          tokens={tokens.filter(
            (token) => token.coinDenom !== selectedTokenDenom
          )}
          onSelect={(tokenDenom) => {
            setToggleOpen(false);
            onSelectToken(tokenIndex(tokenDenom));
          }}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

const TokensDropdown: FunctionComponent<
  {
    tokens: PoolAssetInfo[];
    onSelect: (coinDenom: string) => void;
  } & MobileProps
> = ({ tokens, onSelect, isMobile = false }) => (
  <div className="absolute z-40 flex w-64 flex-col rounded-b-xl bg-osmoverse-700 md:w-52">
    {tokens.map((token, index) => {
      return (
        <button
          className={classNames(
            "cursor-pointer border-t border-dashed border-white-faint p-5 transition-colors hover:bg-white-faint md:p-2",
            { "rounded-b-xl": index === tokens.length - 1 }
          )}
          key={token.coinDenom}
          onClick={() => onSelect(token.coinDenom)}
        >
          <Token {...token} ringColorIndex={index} isMobile={isMobile} />
        </button>
      );
    })}
  </div>
);
