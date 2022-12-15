import { FunctionComponent } from "react";

export const RightArrowIcon: FunctionComponent<{
  classes?: Partial<Record<"container", string>>;
}> = ({ classes }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={classes?.container}
    >
      <path
        d="M4 12H18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 6L19 12L14 18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
