import classNames from "classnames";
import { FunctionComponent } from "react";

export const DownChevronIcon: FunctionComponent<{
  classes?: Partial<Record<"container", string>>;
}> = ({ classes }) => {
  return (
    <svg
      width="14"
      height="8"
      viewBox="0 0 14 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={classNames("text-wosmongton-300", classes?.container)}
    >
      <path
        d="M13.6666 1.01196C13.6666 1.27267 13.5701 1.53338 13.3819 1.73275L7.80715 7.64728C7.3631 8.11757 6.63911 8.11757 6.19506 7.64728L0.615523 1.73786C0.200436 1.29823 0.243876 0.556998 0.741015 0.178714C1.13197 -0.11778 1.67737 -0.0308761 2.02006 0.332072L7.0011 5.60761L11.9773 0.337185C12.3393 -0.0462121 12.9378 -0.11778 13.3288 0.234945C13.5556 0.439424 13.6666 0.725692 13.6666 1.01196Z"
        fill="currentcolor"
      />
    </svg>
  );
};
