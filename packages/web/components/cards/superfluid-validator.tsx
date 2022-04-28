import { FunctionComponent } from "react";
import { MobileProps } from "../types";

export const SuperfluidValidatorCard: FunctionComponent<
  {
    validatorName?: string;
    validatorImgSrc: string;
    validatorCommission?: string;
    delegation: string;
    apr: string;
  } & MobileProps
> = ({
  validatorName,
  validatorImgSrc,
  validatorCommission,
  delegation,
  apr,
  isMobile = false,
}) => (
  <div className="w-full p-0.5 md:rounded-2xl rounded-xl bg-superfluid my-2">
    <div className="flex flex-col w-full gap-1 bg-card md:rounded-2xlinset rounded-xlinset py-5 px-7">
      {!isMobile && (
        <>
          <div className="flex place-content-between text-subtitle1">
            <span>My Superfluid Validator</span>
            <span>My Superfluid Delegation</span>
          </div>
          <hr className="my-3 text-white-faint" />
        </>
      )}
      <div className="flex place-content-between">
        <div className="flex gap-3">
          <div className="rounded-full border border-enabledGold w-14 h-14 p-1 flex shrink-0">
            <img className="rounded-full" alt="" src={validatorImgSrc} />
          </div>
          <div className="flex flex-col place-content-evenly">
            <span className="subtitle2 md:text-sm text-white-high">
              {validatorName ?? ""}
            </span>
            <span className="text-sm text-iconDefault">
              Commission - {validatorCommission ?? ""}
            </span>
          </div>
        </div>
        <div className="flex flex-col place-content-evenly text-right">
          {isMobile ? (
            <span className="subtitle2">~{delegation}</span>
          ) : (
            <h6 className="text-white-high">~{delegation}</h6>
          )}
          <span className="text-sm text-iconDefault">~{apr} APR</span>
        </div>
      </div>
    </div>
  </div>
);
