import { FunctionComponent, ReactElement } from "react";
import { useWindowSize } from "../../hooks";
import { OverviewLabelValue } from "./overview-label-value";
import { Button } from "../buttons/button";
import { ButtonProps } from "../buttons/types";
import { Metric } from "../types";

interface LabelButton extends ButtonProps {
  label: string;
}

interface Props {
  /** Title at top left of overview. */
  title: string | ReactElement;
  /** Label buttons to the right of the title at the top.
   *  Accepts at most 2.
   */
  titleButtons?: LabelButton[];
  /** First row of overview labels, with more prominent value text size.
   *  Accepts at most 2. 4 if there is no background image.
   */
  primaryOverviewLabels: Metric[];
  /** Second row of overview labels, with slightly less prominent value text size.
   *  Accepts at most 3.
   */
  secondaryOverviewLabels?: Metric[];
  /**
   *  Image url of the right-fixed background image.
   */
  bgImageUrl?: string;
}

export const Overview: FunctionComponent<Props> = ({
  title,
  titleButtons,
  primaryOverviewLabels,
  secondaryOverviewLabels,
  bgImageUrl,
}) => {
  const { width, isMobile } = useWindowSize();

  return (
    <section
      className="bg-background bg-right-bottom bg-contain bg-no-repeat"
      style={
        bgImageUrl
          ? {
              backgroundImage: `${
                width < 1000
                  ? "linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)),"
                  : ""
              } url(${bgImageUrl})`,
            }
          : undefined
      }
    >
      <div className="max-w-container mx-auto md:pt-24 pt-0">
        <div className="md:p-4 p-10">
          <div className="flex flex-wrap md:gap-5 gap-8 items-center place-content-start">
            {typeof title === "string" ? (
              isMobile ? (
                <h6 className="text-white-full">{title}</h6>
              ) : (
                <h5 className="text-white-full">{title}</h5>
              )
            ) : (
              <>{title}</>
            )}
            <div className="flex flex-wrap md:gap-2 gap-5">
              {titleButtons?.slice(0, 2).map(({ label, onClick }, index) => (
                <Button
                  className="md:px-1"
                  key={index}
                  color="primary"
                  size="sm"
                  onClick={onClick}
                >
                  <span className="md:caption">{label}</span>
                </Button>
              ))}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap md:gap-9 gap-20">
            {primaryOverviewLabels
              .slice(0, bgImageUrl ? 2 : 4)
              .map((label, index) => (
                <OverviewLabelValue
                  key={index}
                  {...label}
                  isMobile={isMobile}
                />
              ))}
          </div>
          {secondaryOverviewLabels && (
            <div className="mt-6 flex flex-wrap md:gap-9 gap-20">
              {secondaryOverviewLabels.slice(0, 3).map((label, index) => (
                <OverviewLabelValue
                  prominence="secondary"
                  key={index}
                  {...label}
                  isMobile={isMobile}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
