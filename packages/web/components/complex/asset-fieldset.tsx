import classNames from "classnames";
import { ChangeEventHandler, PropsWithChildren, ReactNode } from "react";

import { useTranslation } from "~/hooks";

const AssetFieldset = ({ children }: PropsWithChildren<unknown>) => (
  <div className="flex flex-col">{children}</div>
);

const AssetFieldsetHeader = ({ children }: PropsWithChildren<unknown>) => (
  <div className="flex w-full items-center justify-between pt-3">
    {children}
  </div>
);

const AssetFieldsetHeaderLabel = ({ children }: PropsWithChildren<unknown>) =>
  children;

const AssetFieldsetHeaderBalance = ({
  onMax,
  availableBalance,
  className,
}: {
  onMax?: () => void;
  availableBalance?: string;
  className?: string;
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={classNames(
        "flex items-center gap-2 transition-opacity",
        className
      )}
    >
      <span>
        {availableBalance} {t("pool.available").toLowerCase()}
      </span>
      <button
        type="button"
        className="flex items-center justify-center rounded-5xl border border-osmoverse-700 py-1.5 px-3"
        onClick={onMax}
      >
        <span className="body2 text-wosmongton-300">Max</span>
      </button>
    </div>
  );
};

interface AssetFieldsetInputProps {
  inputPrefix?: ReactNode;
  onInputChange?: ChangeEventHandler<HTMLInputElement>;
  inputValue?: string;
  outputValue?: string;
}

const AssetFieldsetInput = ({
  inputPrefix,
  inputValue,
  onInputChange,
  outputValue,
}: AssetFieldsetInputProps) => (
  <div className="flex items-center">
    {inputPrefix}
    {outputValue || (
      <input
        className="w-full bg-transparent text-h3 font-h3"
        placeholder="0"
        onChange={onInputChange}
        value={inputValue}
      />
    )}
  </div>
);

const AssetFieldsetTokenSelector = ({
  children,
}: PropsWithChildren<unknown>) => <div className="flex pl-3">{children}</div>;

const AssetFieldsetFooter = ({ children }: PropsWithChildren<unknown>) => (
  <div className="flex w-full items-center justify-between pb-4">
    {children}
  </div>
);

export {
  AssetFieldset,
  AssetFieldsetFooter,
  AssetFieldsetHeader,
  AssetFieldsetHeaderBalance,
  AssetFieldsetHeaderLabel,
  AssetFieldsetInput,
  AssetFieldsetTokenSelector,
};
