import { FunctionComponent } from "react";

export const UnlockIcon: FunctionComponent<{
  classes?: Partial<Record<"container", string>>;
}> = ({ classes }) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={classes?.container}
    >
      <path
        d="M12.6667 7.3335H3.33333C2.59695 7.3335 2 7.93045 2 8.66683V13.3335C2 14.0699 2.59695 14.6668 3.33333 14.6668H12.6667C13.403 14.6668 14 14.0699 14 13.3335V8.66683C14 7.93045 13.403 7.3335 12.6667 7.3335Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.66699 7.33344V4.66677C4.66616 3.84013 4.97251 3.04268 5.52658 2.42921C6.08064 1.81575 6.84288 1.43004 7.66533 1.34696C8.48778 1.26389 9.31176 1.48937 9.97731 1.97964C10.6429 2.46992 11.1025 3.19 11.267 4.0001"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
