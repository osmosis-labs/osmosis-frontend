import classNames from "classnames";
import { FunctionComponent } from "react";

export const ChevronRightIcon: FunctionComponent<{
  classes?: Partial<Record<"container", string>>;
}> = ({ classes }) => {
  return (
    <svg
      width="8"
      height="14"
      viewBox="0 0 8 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={classNames("text-inherit", classes?.container)}
    >
      <path
        d="M1.01201 0.333336C1.27272 0.333336 1.53342 0.429867 1.73279 0.618103L7.64728 6.19278C8.11757 6.63682 8.11757 7.36081 7.64728 7.80485L1.7379 13.3844C1.29827 13.7994 0.557047 13.756 0.178765 13.2589C-0.117727 12.8679 -0.0308238 12.3225 0.332122 11.9798L5.60762 6.99882L0.337235 2.02263C-0.0461585 1.66064 -0.117725 1.06215 0.234997 0.671195C0.439474 0.444347 0.725741 0.333336 1.01201 0.333336Z"
        fill="currentcolor"
      />
    </svg>
  );
};
