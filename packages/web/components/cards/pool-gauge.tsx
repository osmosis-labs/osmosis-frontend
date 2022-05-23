import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { MetricLoader } from "../loaders";
import { InfoTooltip } from "../tooltip";
import { LoadingProps, MobileProps } from "../types";

export const PoolGaugeCard: FunctionComponent<
  {
    days?: string;
    apr?: string;
    superfluidApr?: string;
  } & LoadingProps &
    MobileProps
> = ({ days, apr, isLoading = false, superfluidApr, isMobile = false }) => (
  <div
    className={classNames(
      "w-full p-0.5 rounded-xl ",
      superfluidApr ? "bg-superfluid" : "bg-card" // vanilla tailwind does not support border gradients
    )}
  >
    <div className="flex flex-col w-full gap-1 bg-card rounded-xlinset md:pl-[30%] md:p-3.5 py-5 px-7">
      <UnbondingPeriodHeader isMobile={isMobile}>
        <MetricLoader className="h-6 md:h-4" isLoading={isLoading}>
          {days ?? "0"} unbonding
          {superfluidApr && (
            <>
              {" "}
              <div className="h-[24px] w-[24px] shrink-0">
                <Image
                  alt="superfluid"
                  src="/icons/superfluid-osmo.svg"
                  height={24}
                  width={24}
                />
              </div>
              <InfoTooltip
                className="flex shrink-0"
                style="secondary-200"
                size={{ height: 23, width: 23 }}
                content="Superfluid Staking lets you secure the network and receive additional rewards paid out in OSMO."
              />
            </>
          )}
        </MetricLoader>
      </UnbondingPeriodHeader>
      <MetricLoader className="h-6 md:h-4" isLoading={isLoading}>
        <p className="font-caption text-lg text-secondary-200 md:subtitle2">
          APR {apr ?? "0%"} {superfluidApr ? `+ ${superfluidApr}` : null}
        </p>
      </MetricLoader>
    </div>
  </div>
);

const UnbondingPeriodHeader: FunctionComponent<MobileProps> = ({
  isMobile = false,
  children,
}) =>
  isMobile ? (
    <span className="flex items-center gap-2 subtitle1">{children}</span>
  ) : (
    <h5 className="flex items-center gap-2 font-medium">{children}</h5>
  );
