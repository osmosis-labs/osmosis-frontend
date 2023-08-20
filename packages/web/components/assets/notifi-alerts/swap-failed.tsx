import { FunctionComponent } from "react";

export const SwapFailedIcon: FunctionComponent<{ className?: string }> = ({
  className,
}) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_925_2097)">
        <mask
          id="mask0_925_2097"
          // style="mask-type:luminance"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="24"
          height="24"
        >
          <path d="M24 0H0V24H24V0Z" fill="white" />
        </mask>
        <g mask="url(#mask0_925_2097)">
          <path
            d="M5.19995 21C4.69995 21 4.19995 20.8 3.79995 20.4C2.99995 19.6 2.99995 18.4 3.79995 17.6L16.2 3.6C16.5 3.2 17 3 17.6 3C18.2 3 18.6 3.2 19 3.6C19.4 4 19.6 4.5 19.6 5C19.6 5.5 19.4 6 19 6.4L6.59995 20.4C6.19995 20.8 5.69995 21 5.19995 21Z"
            fill="url(#paint0_linear_925_2097)"
          />
          <path
            d="M1.49997 5.8C1.09997 5.4 0.899971 4.9 0.999971 4.3C1.19997 3.5 1.79997 3 2.59997 3H9.29997C9.69997 3 10.2 3.2 10.4 3.5C10.7 3.8 10.9 4.2 10.9 4.6C10.9 5.5 10.2 6.2 9.29997 6.2H6.39997L9.09997 8.9L6.79997 11.2L1.49997 5.8Z"
            fill="url(#paint1_linear_925_2097)"
          />
          <path
            d="M14.7 20.2C14.3 20.2 13.8 20 13.6 19.7C13.3 19.4 13.1 19 13.1 18.6C13.1 17.7 13.8 17 14.7 17H17.6L14.9 14.3L17.2 12L22.6 17.4C23 17.8 23.2 18.3 23.1 18.8C23 19.6 22.4 20.2 21.5 20.2H14.7Z"
            fill="url(#paint2_linear_925_2097)"
          />
        </g>
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_925_2097"
          x1="18.6848"
          y1="4.6908"
          x2="4.66095"
          y2="18.7145"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="1.61469e-07" stopColor="#FF6A6A" />
          <stop offset="0.0750084" stopColor="#FF6665" />
          <stop offset="0.6843" stopColor="#FF4B3C" />
          <stop offset="1" stopColor="#FF412D" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_925_2097"
          x1="11.6151"
          y1="-0.1548"
          x2="-1.38863"
          y2="12.8489"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="1.61469e-07" stopColor="#FF6A6A" />
          <stop offset="0.0750084" stopColor="#FF6665" />
          <stop offset="0.6843" stopColor="#FF4B3C" />
          <stop offset="1" stopColor="#FF412D" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_925_2097"
          x1="25.7433"
          y1="9.9489"
          x2="12.7391"
          y2="22.9532"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="1.61469e-07" stopColor="#FF6A6A" />
          <stop offset="0.0750084" stopColor="#FF6665" />
          <stop offset="0.6843" stopColor="#FF4B3C" />
          <stop offset="1" stopColor="#FF412D" />
        </linearGradient>
        <clipPath id="clip0_925_2097">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
