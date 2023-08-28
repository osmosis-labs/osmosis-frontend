import { FunctionComponent } from "react";

export const NewTokenIcon: FunctionComponent<{ className?: string }> = ({
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
      <g clipPath="url(#clip0_925_2107)">
        <mask
          id="mask0_925_2107"
          // style="mask-type:luminance"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="24"
          height="24"
        >
          <path d="M24 0H0V24H24V0Z" fill="white" />
        </mask>
        <g mask="url(#mask0_925_2107)">
          <path
            d="M14.1 13.9L12.9 10.7L9.6 9.49999C8.8 9.09999 8.2 8.29999 8.2 7.39999C8.2 7.29999 8.2 7.19999 8.2 7.09999C4.4 7.69999 1.5 11 1.5 14.9C1.5 19.3 5.1 22.9 9.5 22.9C13.9 22.9 17.5 19.3 17.5 14.9C17.1 15.2 16.7 15.3 16.2 15.3C15.2 15.4 14.4 14.8 14.1 13.9Z"
            fill="url(#paint0_linear_925_2107)"
          />
          <path
            d="M16.7 1.39999L18.1 5.09999C18.2 5.29999 18.3 5.39999 18.4 5.39999L22.1 6.79999C22.6 6.99999 22.6 7.69999 22.1 7.89999L18.4 9.29999C18.2 9.39999 18.1 9.49999 18.1 9.59999L16.7 13.3C16.5 13.8 15.8 13.8 15.6 13.3L14.2 9.59999C14.1 9.39999 14 9.29999 13.9 9.29999L10.2 7.89999C9.69995 7.69999 9.69995 6.99999 10.2 6.79999L13.9 5.39999C14.1 5.29999 14.2 5.19999 14.2 5.09999L15.6 1.39999C15.8 0.899994 16.5 0.899994 16.7 1.39999Z"
            fill="url(#paint1_linear_925_2107)"
          />
        </g>
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_925_2107"
          x1="9.504"
          y1="22.9528"
          x2="9.504"
          y2="7.06029"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5A700" />
          <stop offset="0.6882" stopColor="#FBB600" />
          <stop offset="1" stopColor="#FFBF00" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_925_2107"
          x1="16.1811"
          y1="13.685"
          x2="16.1811"
          y2="1.04719"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5D75D" />
          <stop offset="0.2656" stopColor="#F7DC6C" />
          <stop offset="0.7778" stopColor="#FCEA95" />
          <stop offset="1" stopColor="#FFF0A8" />
        </linearGradient>
        <clipPath id="clip0_925_2107">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
