import Image from "next/image";
import { FunctionComponent, useState } from "react";
import classNames from "classnames";
import { Token, PoolAssetInfo } from "../assets";
import { CustomClasses } from "../types";

/** Used to select a token token from within a pool. */
export const PoolTokenSelect: FunctionComponent<
  {
    tokens: PoolAssetInfo[];
    selectedTokenDenom: string;
    onSelectToken: (coinDenom: string) => void;
  } & CustomClasses
> = ({ tokens, selectedTokenDenom, onSelectToken, className }) => {
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
          "px-3 flex h-full  hover:bg-card cursor-pointer",
          {
            "bg-card rounded-t-xl w-64": isToggleOpen,
            "rounded-xl": !isToggleOpen,
          },
          className
        )}
      >
        <div
          className="relative flex gap-3"
          onClick={() => setToggleOpen(!isToggleOpen)}
        >
          <Token
            {...selectedToken}
            ringColorIndex={tokenIndex(selectedToken.coinDenom)}
          />
          <div
            className={classNames("my-auto transition", {
              "rotate-180": isToggleOpen,
            })}
          >
            <Image
              alt=""
              src="/icons/chevron-down.svg"
              height={20}
              width={20}
            />
          </div>
        </div>
      </div>
      {isToggleOpen && (
        <TokensDropdown
          tokens={tokens.filter(
            (token) => token.coinDenom !== selectedTokenDenom
          )}
          onSelect={(coinDenom) => {
            setToggleOpen(false);
            onSelectToken(coinDenom);
          }}
        />
      )}
    </div>
  );
};

const TokensDropdown: FunctionComponent<{
  tokens: PoolAssetInfo[];
  onSelect: (coinDenom: string) => void;
}> = ({ tokens, onSelect }) => (
  <div className="absolute flex flex-col bg-card rounded-b-xl z-50 w-64">
    {tokens.map((token, index) => (
      <div
        className={classNames(
          "hover:bg-white-faint cursor-pointer p-5 border-t border-dashed border-white-faint",
          { "rounded-b-xl": index === tokens.length - 1 }
        )}
        key={token.coinDenom}
        onClick={() => onSelect(token.coinDenom)}
      >
        <Token {...token} ringColorIndex={index} />
      </div>
    ))}
  </div>
);
