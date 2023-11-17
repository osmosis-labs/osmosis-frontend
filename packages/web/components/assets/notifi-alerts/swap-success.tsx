import { FunctionComponent } from "react";

export const SwapSuccessIcon: FunctionComponent<{ className?: string }> = ({
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
      <g clipPath="url(#clip0_925_2066)">
        <mask
          id="mask0_925_2066"
          // style="mask-type:luminance"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="24"
          height="24"
        >
          <path d="M24 0H0V24H24V0Z" fill="white" />
        </mask>
        <g mask="url(#mask0_925_2066)">
          <path
            d="M2.7999 5.9C2.3999 5.5 2.1999 4.9 2.2999 4.4C2.4999 3.5 3.0999 3 3.9999 3H10.8999C11.3999 3 11.7999 3.2 12.0999 3.5C12.3999 3.8 12.5999 4.2 12.5999 4.7C12.5999 5.7 11.8999 6.4 10.8999 6.4H7.8999L10.6999 9.2L8.3999 11.5L2.7999 5.9Z"
            fill="url(#paint0_linear_925_2066)"
          />
          <path
            d="M14.4 20.8C13.9 20.8 13.5 20.6 13.2 20.3C12.9 20 12.7 19.6 12.7 19.1C12.7 18.1 13.4 17.4 14.4 17.4H17.4L14.6 14.6L16.9 12.3L22.4 17.8C22.8 18.2 23 18.8 22.9 19.3C22.8 20.2 22.1 20.7 21.3 20.7H14.4V20.8Z"
            fill="url(#paint1_linear_925_2066)"
          />
          <path
            d="M21 3.70001C20.6 3.30001 20.1 3.10001 19.6 3.10001C19.1 3.10001 18.6 3.30001 18.2 3.70001L5.99995 15.8L4.09995 13.9C3.69995 13.5 3.19995 13.3 2.69995 13.3C2.19995 13.3 1.69995 13.5 1.29995 13.9C0.899951 14.3 0.699951 14.8 0.699951 15.3C0.699951 15.8 0.899951 16.3 1.29995 16.7L4.59995 20C4.99995 20.4 5.49995 20.7 5.99995 20.7C6.49995 20.7 6.99995 20.5 7.39995 20.1L21 6.50001C21.4 6.10001 21.6 5.60001 21.6 5.10001C21.6 4.60001 21.4 4.00001 21 3.70001Z"
            fill="url(#paint2_linear_925_2066)"
          />
        </g>
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_925_2066"
          x1="7.445"
          y1="21.8939"
          x2="7.445"
          y2="3.0311"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="3.22937e-07" stopColor="#00CEBA" />
          <stop offset="0.6142" stopColor="#14EFA6" />
          <stop offset="1" stopColor="#1DFE9D" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_925_2066"
          x1="17.8788"
          y1="21.8939"
          x2="17.8788"
          y2="3.0311"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="3.22937e-07" stopColor="#00CEBA" />
          <stop offset="0.6142" stopColor="#14EFA6" />
          <stop offset="1" stopColor="#1DFE9D" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_925_2066"
          x1="11.1401"
          y1="21.4106"
          x2="11.1401"
          y2="3.59531"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="3.22937e-07" stopColor="#00CEBA" />
          <stop offset="0.6142" stopColor="#14EFA6" />
          <stop offset="1" stopColor="#1DFE9D" />
        </linearGradient>
        <clipPath id="clip0_925_2066">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
