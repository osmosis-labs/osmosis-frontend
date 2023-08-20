import { FunctionComponent } from "react";

export const PriceAlertIcon: FunctionComponent<{ className?: string }> = ({
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
      <g clipPath="url(#clip0_925_2032)">
        <mask
          id="mask0_925_2032"
          // style="mask-type:luminance"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="24"
          height="24"
        >
          <path d="M24 0H0V24H24V0Z" fill="white" />
        </mask>
        <g mask="url(#mask0_925_2032)">
          <path
            d="M22.3 3.10001L17.3 6.00001C17 6.20001 17 6.60001 17.3 6.80001L18.7 7.60001C17.8 9.20001 16.5 10.7 15.3 11C15 11.1 14.5 11.1 13.8 10.6C12.3 9.30001 10.7 8.80001 9.30005 9.00001C6.40005 9.50001 4.50005 12.8 1.60005 17.8L1.20005 18.5C0.800047 19.1 1.00005 19.9 1.60005 20.2C1.80005 20.3 2.00005 20.4 2.20005 20.4C2.60005 20.4 3.00005 20.2 3.30005 19.8L3.70005 19.1C6.10005 15.1 8.00005 11.9 9.70005 11.5C10.4 11.4 11.3 11.7 12.3 12.6C13.4 13.5 14.7 13.8 16 13.5C18.1 13 19.8 10.7 20.9 8.90001L22.3 9.70001C22.6 9.90001 23 9.70001 23 9.30001V3.40001C23 3.10001 22.6 2.90001 22.3 3.10001Z"
            fill="url(#paint0_linear_925_2032)"
          />
          <path
            d="M21.7 21H15.9C15.6 21 15.3 20.6 15.5 20.3L16.4 18.8C11.5 15.6 8.50002 16.7 5.40002 18.7C6.30002 17.1 7.20002 15.7 8.00002 14.7C9.40002 14.3 10.9 14.2 12.6 14.5C13.3 14.6 14.1 14.9 14.9 15.2C15.8 15.6 16.7 16 17.6 16.6L18.4 15.2C18.6 14.9 19 14.9 19.2 15.2L22.1 20.2C22.2 20.6 22 21 21.7 21Z"
            fill="url(#paint1_linear_925_2032)"
          />
        </g>
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_925_2032"
          x1="1.00005"
          y1="11.686"
          x2="23"
          y2="11.686"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="3.22937e-07" stopColor="#00CEBA" />
          <stop offset="0.6142" stopColor="#14EFA6" />
          <stop offset="1" stopColor="#1DFE9D" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_925_2032"
          x1="5.36522"
          y1="17.6719"
          x2="22.1368"
          y2="17.6719"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF412D" />
          <stop offset="1" stopColor="#FF4B34" />
        </linearGradient>
        <clipPath id="clip0_925_2032">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
