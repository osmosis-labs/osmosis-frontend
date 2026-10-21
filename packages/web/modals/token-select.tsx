import { AppCurrency, CoinPretty, IBCCurrency } from "@osmosis-labs/unit";
import classNames from "classnames";
import { FunctionComponent } from "react";

import { SearchBox } from "~/components/input";
import { PrivateText } from "~/components/privacy";
import { InputProps } from "~/components/types";
import { EntityImage } from "~/components/ui/entity-image";
import { useTranslation } from "~/hooks";
import { useCoinFiatValue } from "~/hooks/queries/assets/use-coin-fiat-value";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { getLogoURIs } from "~/utils/logo-uri";

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
    onSelect: (tokenDenom: string) => void;
    /** Emit `coinMinimalDenom` from `onSelect` instead of the display denom, so
     *  assets sharing a symbol resolve unambiguously. Default: display denom. */
    keyByMinimalDenom?: boolean;
  } & InputProps<string>
> = (props) => {
  const { t } = useTranslation();

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
      <ul className="max-h-128 flex flex-col overflow-y-auto md:max-h-64">
        {props.tokens.map((t) => {
          const currency =
            t.token instanceof CoinPretty ? t.token.currency : t.token;
          const selectKey = props.keyByMinimalDenom
            ? currency.coinMinimalDenom
            : currency.coinDenom;
          return (
            <TokenRow
              key={selectKey}
              token={t.token}
              chainName={t.chainName}
              onSelect={() => {
                props.onSelect(selectKey);
                props.onRequestClose();
              }}
            />
          );
        })}
      </ul>
    </ModalBase>
  );
};

const TokenRow: FunctionComponent<{
  token: CoinPretty | AppCurrency;
  chainName: string;
  onSelect: () => void;
}> = ({ token, chainName, onSelect }) => {
  const currency = token instanceof CoinPretty ? token.currency : token;
  const { coinDenom, coinImageUrl } = currency;
  const networkName = chainName;
  const justDenom = coinDenom.split(" ").slice(0, 1).join(" ") ?? "";
  const channel =
    "paths" in currency
      ? (currency as IBCCurrency).paths[0].channelId
      : undefined;

  const showChannel = coinDenom.includes("channel");

  const tokenAmount =
    token instanceof CoinPretty
      ? token.hideDenom(true).maxDecimals(8).trim(true).toString()
      : undefined;
  const { fiatValue } = useCoinFiatValue(
    token instanceof CoinPretty ? token : undefined
  );
  const tokenPrice = fiatValue?.toString();

  return (
    <li
      className="mx-3 my-1 flex cursor-pointer items-center justify-between rounded-2xl px-4 py-2.5 hover:bg-osmoverse-900"
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <button className="flex w-full items-center justify-between text-left">
        <div className="flex items-center">
          <div className="mr-4 h-8 w-8 overflow-hidden rounded-full">
            <EntityImage
              symbol={coinDenom}
              name={coinDenom}
              logoURIs={getLogoURIs(coinImageUrl)}
              width={32}
              height={32}
              className="rounded-full"
            />
          </div>
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
              "md:text-subtitle2 md:font-subtitle2": tokenAmount.length > 10,
            })}
          >
            <PrivateText text={tokenAmount} />
          </h6>
          <span className="subtitle1 text-osmoverse-400">
            <PrivateText text={tokenPrice} />
          </span>
        </div>
      )}
    </li>
  );
};
