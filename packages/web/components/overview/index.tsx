import { FunctionComponent, ReactElement } from "react";
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
}) => (
  <section
    className="bg-background bg-right-bottom bg-contain bg-no-repeat "
    style={{
      backgroundImage: `url(${bgImageUrl})`,
    }}
  >
    <div className="max-w-container mx-auto">
      <div className="p-10">
        <div className="flex items-center">
          {typeof title === "string" ? (
            <h5 className="text-white-full">{title}</h5>
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
        <div className="mt-6 flex items-center gap-20">
          {primaryOverviewLabels
            .slice(0, bgImageUrl ? 2 : 4)
            .map((label, index) => (
              <OverviewLabelValue key={index} {...label} />
            ))}
        </div>
        {secondaryOverviewLabels && (
          <div className="mt-6 flex items-center gap-20">
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
