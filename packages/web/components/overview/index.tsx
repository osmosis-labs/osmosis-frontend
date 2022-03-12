import { FunctionComponent } from "react";
import { OverviewLabelValue } from "./overview-label-value";
import { Button } from "../buttons/button";
import { ButtonProps } from "../buttons/types";
import { OverviewLabel } from "./types";

interface LabelButton extends ButtonProps {
  label: string;
}

interface Props {
  /** Title text at top left of overview. */
  title: string;
  /** Label buttons to the right of the title at the top.
   *  Accepts at most 2.
   */
  titleButtons?: LabelButton[];
  /** First row of overview labels, with more prominent value text size.
   *  Accepts at most 2. 4 if there is no background image.
   */
  primaryOverviewLabels: OverviewLabel[];
  /** Second row of overview labels, with slightly less prominent value text size.
   *  Accepts at most 3.
   */
  secondaryOverviewLabels?: OverviewLabel[];
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
  <section className="bg-background">
    <div className="max-w-container mx-auto">
      <div
        className="bg-right bg-contain bg-no-repeat p-10"
        style={{
          backgroundImage: `url(${bgImageUrl})`,
        }}
      >
        <div className="flex items-center">
          <h5 className="text-white-full">{title}</h5>
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
        <div className="mt-6 flex items-center gap-20">
          {secondaryOverviewLabels?.slice(0, 3).map((label, index) => (
            <OverviewLabelValue prominence="secondary" key={index} {...label} />
          ))}
        </div>
      </div>
    </div>
  </section>
);
