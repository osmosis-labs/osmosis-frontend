import { FunctionComponent } from "react";

export const PositionOutOfRangeIcon: FunctionComponent<{
  className?: string;
}> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_925_2076)">
        <mask
          id="mask0_925_2076"
          // style="mask-type:luminance"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="24"
          height="24"
        >
          <path d="M24 0H0V24H24V0Z" fill="white" />
        </mask>
        <g mask="url(#mask0_925_2076)">
          <path
            d="M7.69995 11.4C7.69995 10.4 6.89995 9.5 5.79995 9.5H3.09995C2.09995 9.5 1.19995 10.3 1.19995 11.4C1.19995 12.5 1.99995 13.3 3.09995 13.3H5.89995C6.89995 13.2 7.69995 12.4 7.69995 11.4Z"
            fill="url(#paint0_linear_925_2076)"
          />
          <path
            d="M16.2999 11.4C16.2999 12.4 17.0999 13.3 18.1999 13.3H20.9999C21.9999 13.3 22.8999 12.5 22.8999 11.4C22.8999 10.3 21.9999 9.5 20.8999 9.5H18.0999C17.0999 9.5 16.2999 10.3 16.2999 11.4Z"
            fill="url(#paint1_linear_925_2076)"
          />
          <path
            d="M12.4999 23.1C12.7999 23 13.0999 22.9 13.2999 22.6L17.0999 18.8C17.4999 18.4 17.6999 18 17.6999 17.5C17.6999 17 17.4999 16.5 17.0999 16.2C16.3999 15.5 15.1999 15.5 14.3999 16.2L13.6999 16.9V2.7C13.6999 1.7 12.8999 0.800003 11.7999 0.800003C10.6999 0.800003 9.99993 1.7 9.99993 2.7V16.7L9.39993 16.1C8.69993 15.4 7.49993 15.4 6.69993 16.1C5.99993 16.8 5.99993 18 6.69993 18.8L10.4999 22.6C11.0999 23.1 11.7999 23.3 12.4999 23.1Z"
            fill="url(#paint2_linear_925_2076)"
          />
        </g>
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_925_2076"
          x1="4.47455"
          y1="1.2171"
          x2="4.47455"
          y2="22.2246"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F56502" />
          <stop offset="0.6047" stopColor="#FA7402" />
          <stop offset="1" stopColor="#FF8102" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_925_2076"
          x1="19.5253"
          y1="1.2171"
          x2="19.5253"
          y2="22.2246"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F56502" />
          <stop offset="0.6047" stopColor="#FA7402" />
          <stop offset="1" stopColor="#FF8102" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_925_2076"
          x1="11.9354"
          y1="1.2171"
          x2="11.9354"
          y2="22.2246"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F56502" />
          <stop offset="0.6047" stopColor="#FA7402" />
          <stop offset="1" stopColor="#FF8102" />
        </linearGradient>
        <clipPath id="clip0_925_2076">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
