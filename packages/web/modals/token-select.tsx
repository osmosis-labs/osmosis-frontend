import { AppCurrency, IBCCurrency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent } from "react";
import { t } from "react-multi-lang";

import { SearchBox } from "~/components/input";
import { InputProps } from "~/components/types";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";

/** Intended for mobile use only - full screen alternative to token select dropdown.
 *
 *  Forward ref for search input.
 */
export const TokenSelectModal: FunctionComponent<
  ModalBaseProps & {
    tokens: {
      token: CoinPretty | AppCurrency;
      chainName: string;
    }[];
    onSelect: (coinDenom: string) => void;
  } & InputProps<string>
> = observer((props) => {
  const { priceStore } = useStore();

  return (
    <ModalBase
      className="!rounded-xl !p-0"
      {...props}
      hideCloseButton
      title=""
      overlayClassName="md:-bottom-1/3"
    >
      <div className="p-4" onClick={(e) => e.stopPropagation()}>
        <SearchBox
          autoFocus
          type="text"
          className="!w-full"
          placeholder={props.placeholder ?? t("components.searchTokens")}
          currentValue={props.currentValue}
          onInput={(value) => props.onInput(value)}
          onFocus={props.onFocus}
          size="large"
        />
      </div>
      <ul className="flex max-h-64 flex-col overflow-y-auto">
        {props.tokens.map((t) => {
          const currency =
            t.token instanceof CoinPretty ? t.token.currency : t.token;
          const { coinDenom, coinImageUrl } = currency;
          const networkName = t.chainName;
          const justDenom = coinDenom.split(" ").slice(0, 1).join(" ") ?? "";
          const channel =
            "paths" in currency
              ? (currency as IBCCurrency).paths[0].channelId
              : undefined;

          const showChannel = coinDenom.includes("channel");

          const tokenAmount =
            t.token instanceof CoinPretty
              ? t.token.hideDenom(true).maxDecimals(8).trim(true).toString()
              : undefined;
          const tokenPrice =
            t.token instanceof CoinPretty
              ? priceStore.calculatePrice(t.token)?.toString()
              : undefined;

          return (
            <li
              key={currency.coinDenom}
              className="mx-3 my-1 flex cursor-pointer items-center justify-between rounded-2xl px-4 py-2.5 hover:bg-osmoverse-900"
              onClick={(e) => {
                e.stopPropagation();
                props.onSelect(coinDenom);
                props.onRequestClose();
              }}
            >
              <button className="flex w-full items-center justify-between text-left">
                <div className="flex items-center">
                  {coinImageUrl && (
                    <div className="mr-4 h-8 w-8 rounded-full">
                      <Image
                        src={coinImageUrl}
                        alt="token icon"
                        width={32}
                        height={32}
                      />
                    </div>
                  )}
                  <div>
                    <h6 className="text-white-full">{justDenom}</h6>
                    <div className="md:caption text-left font-semibold text-osmoverse-400">
                      {showChannel ? `${networkName} ${channel}` : networkName}
                    </div>
                  </div>
                </div>
              </button>
              {tokenAmount && tokenPrice && (
                <div className="flex flex-col text-right">
                  <h6
                    className={classNames({
                      "md:font-subtitle2 md:text-subtitle2":
                        tokenAmount.length > 10,
                    })}
                  >
                    {tokenAmount}
                  </h6>
                  <span className="subtitle1 text-osmoverse-400">
                    {tokenPrice}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </ModalBase>
  );
});
