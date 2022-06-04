import { FunctionComponent } from "react";
import { MobileProps } from "../types";

export const GoSuperfluidCard: FunctionComponent<
  {
    goSuperfluid: () => void;
  } & MobileProps
> = ({ goSuperfluid, isMobile = false }) => (
  <div className="mt-5 bg-card p-5 rounded-2xl flex md:flex-col gap-2 items-center justify-between font-body">
    <div>
      <div className="text-base font-semibold text-white-high">
        {isMobile
          ? "You're not Superfluid Staking"
          : "Superfluid Staking Inactive"}
      </div>
      <div className="mt-2 text-sm font-medium text-iconDefault">
        You have superfluid eligible bonded liquidity.
        <br />
        Choose a Superfluid Staking validator to earn additional rewards.
      </div>
    </div>
    <button
      className="button bg-superfluid rounded-lg py-2 px-8 text-white-high font-semibold text-sm shadow-elevation-04dp"
      type="button"
      onClick={goSuperfluid}
    >
      Go Superfluid
    </button>
  </div>
);
