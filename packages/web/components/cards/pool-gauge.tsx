import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { MetricLoader } from "../loaders";
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
    <div className="flex flex-col w-full gap-1 bg-card rounded-xlinset py-5 px-7">
      <UnbondingHeader isMobile={isMobile}>
        <MetricLoader className="h-6" isLoading={isLoading}>
          {days ?? "0"} unbonding
          {superfluidApr && (
            <>
              {" "}
              <Image
                alt="superfluid"
                src="/icons/superfluid-osmo.svg"
                height={24}
                width={24}
              />
            </>
          )}
        </MetricLoader>
      </UnbondingHeader>
      <MetricLoader className="h-6" isLoading={isLoading}>
        <p className="font-caption text-lg text-secondary-200">
          APR {apr ?? "0%"} {superfluidApr ? `+ ${superfluidApr}` : null}
        </p>
      </MetricLoader>
    </div>
  </div>
);

const UnbondingHeader: FunctionComponent<MobileProps> = ({
  isMobile = false,
  children,
}) =>
  isMobile ? <h6>{children}</h6> : <h5 className="font-medium">{children}</h5>;
