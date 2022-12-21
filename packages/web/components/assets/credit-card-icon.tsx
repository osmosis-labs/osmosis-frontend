import { FunctionComponent } from "react";

export const CreditCardIcon: FunctionComponent<{
  classes?: Partial<Record<"container" | "backCard" | "frontCard", string>>;
}> = ({ classes }) => {
  return (
    <svg
      width="24"
      height="20"
      viewBox="0 0 24 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={classes?.container}
    >
      <g clipPath="url(#clip0_558_4852)">
        <path
          d="M15.4018 1.25846L2.51708 5.28766C1.72641 5.53491 1.28589 6.37632 1.53314 7.16699L4.21927 15.7568C4.46652 16.5475 5.30792 16.988 6.09859 16.7407L18.9833 12.7115C19.774 12.4643 20.2145 11.6229 19.9672 10.8322L17.2811 2.24241C17.0339 1.45174 16.1925 1.01121 15.4018 1.25846Z"
          stroke="currentcolor"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={classes?.backCard}
        />
        <path
          d="M20.5 5H7C6.17157 5 5.5 5.67157 5.5 6.5V15.5C5.5 16.3284 6.17157 17 7 17H20.5C21.3284 17 22 16.3284 22 15.5V6.5C22 5.67157 21.3284 5 20.5 5Z"
          stroke="currentcolor"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={classes?.frontCard}
        />
        <path
          d="M6.5 9.5H21"
          stroke="currentcolor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="14.75"
          y="12"
          width="5"
          height="3"
          rx="1"
          fill="currentcolor"
        />
      </g>
      <defs>
        <clipPath id="clip0_558_4852">
          <rect
            width="23"
            height="20"
            fill="white"
            transform="translate(0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
