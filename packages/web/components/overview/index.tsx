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
  const { isMobile } = useWindowSize();

  return (
    <section
      className="bg-background bg-right-bottom bg-contain bg-no-repeat"
      style={
        bgImageUrl
          ? {
              backgroundImage: `url(${bgImageUrl})`,
            }
          : undefined
      }
    >
      <div className="max-w-container mx-auto pt-24 md:pt-0">
        <div className="p-10 ">
          <div className="flex flex-wrap items-center">
            {typeof title === "string" ? (
              isMobile ? (
                <h6 className="text-white-full">{title}</h6>
              ) : (
                <h5 className="text-white-full">{title}</h5>
              )
            ) : (
              <>{title}</>
            )}
            {titleButtons?.slice(0, 2).map(({ label, onClick }, index) => (
              <Button
                key={index}
                color="primary"
                size="sm"
                className="ml-6"
                onClick={onClick}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-9 md:gap-20">
            {primaryOverviewLabels
              .slice(0, bgImageUrl ? 2 : 4)
              .map((label, index) => (
                <OverviewLabelValue key={index} {...label} />
              ))}
          </div>
          {secondaryOverviewLabels && (
            <div className="mt-6 flex flex-wrap items-center gap-20">
              {secondaryOverviewLabels.slice(0, 3).map((label, index) => (
                <OverviewLabelValue
                  prominence="secondary"
                  key={index}
                  {...label}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
