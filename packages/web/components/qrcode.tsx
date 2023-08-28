import Image from "next/image";
import QRCodeUtil from "qrcode";
import React, { FunctionComponent, ReactElement, useMemo } from "react";

const generateMatrix = (
  value: string,
  errorCorrectionLevel: QRCodeUtil.QRCodeErrorCorrectionLevel
) => {
  const arr = Array.prototype.slice.call(
    QRCodeUtil.create(value, { errorCorrectionLevel }).modules.data,
    0
  );
  const sqrt = Math.sqrt(arr.length);
  return arr.reduce(
    (rows, key, index) =>
      (index % sqrt === 0
        ? rows.push([key])
        : rows[rows.length - 1].push(key)) && rows,
    []
  );
};

const QRCode: FunctionComponent<{
  errorCorrectionLevel?: QRCodeUtil.QRCodeErrorCorrectionLevel;
  logoUrl?: string;
  logoMargin?: number;
  logoSize?: number;
  size?: number;
  value: string;
}> = ({
  errorCorrectionLevel = "M",
  logoMargin = 10,
  logoSize = 50,
  logoUrl,
  size: sizeProp = 200,
  value,
}) => {
  const padding: NonNullable<string> = "20";
  const size = sizeProp - parseInt(padding, 10) * 2;

  const dots = useMemo(() => {
    const dots: ReactElement[] = [];
    const matrix = generateMatrix(value, errorCorrectionLevel);
    const cellSize = size / matrix.length;
    let qrList = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ];

    qrList.forEach(({ x, y }) => {
      const x1 = (matrix.length - 7) * cellSize * x;
      const y1 = (matrix.length - 7) * cellSize * y;
      for (let i = 0; i < 3; i++) {
        dots.push(
          <rect
            fill={i % 2 !== 0 ? "white" : "black"}
            height={cellSize * (7 - i * 2)}
            key={`${i}-${x}-${y}`}
            rx={(i - 2) * -5 + (i === 0 ? 2 : 0)} // calculated border radius for corner squares
            ry={(i - 2) * -5 + (i === 0 ? 2 : 0)} // calculated border radius for corner squares
            width={cellSize * (7 - i * 2)}
            x={x1 + cellSize * i}
            y={y1 + cellSize * i}
          />
        );
      }
    });

    const clearArenaSize = Math.floor(logoSize / cellSize);
    const matrixMiddleStart = matrix.length / 2 - clearArenaSize / 2;
    const matrixMiddleEnd = matrix.length / 2 + clearArenaSize / 2 - 1;

    matrix.forEach((row: QRCodeUtil.QRCode[], i: number) => {
      row.forEach((_: any, j: number) => {
        if (matrix[i][j]) {
          if (
            !(
              (i < 7 && j < 7) ||
              (i > matrix.length - 8 && j < 7) ||
              (i < 7 && j > matrix.length - 8)
            )
          ) {
            if (
              !(
                i > matrixMiddleStart &&
                i < matrixMiddleEnd &&
                j > matrixMiddleStart &&
                j < matrixMiddleEnd
              )
            ) {
              dots.push(
                <circle
                  cx={i * cellSize + cellSize / 2}
                  cy={j * cellSize + cellSize / 2}
                  fill="black"
                  key={`circle-${i}-${j}`}
                  r={cellSize / 3} // calculate size of single dots
                />
              );
            }
          }
        }
      });
    });

    return dots;
  }, [errorCorrectionLevel, logoSize, size, value]);

  const logoPosition = size / 2 - logoSize / 2;
  const logoWrapperSize = logoSize + logoMargin * 2;

  return (
    <div className="w-max" style={{ padding }}>
      <div
        className="relative select-none"
        style={{
          height: size,
          userSelect: "none",
          width: size,
        }}
      >
        <div
          className="absolute flex justify-center"
          style={{
            top: logoPosition,
            width: size,
          }}
        >
          <Image
            height={logoSize}
            src={logoUrl ?? "/osmosis-logo-wc.png"}
            width={logoSize}
            alt="QR code logo"
          />
        </div>

        <svg height={size} style={{ all: "revert" }} width={size}>
          <defs>
            <clipPath id="clip-wrapper">
              <rect height={logoWrapperSize} width={logoWrapperSize} />
            </clipPath>
            <clipPath id="clip-logo">
              <rect height={logoSize} width={logoSize} />
            </clipPath>
          </defs>
          <rect fill="transparent" height={size} width={size} />
          {dots}
        </svg>
      </div>
    </div>
  );
};

export default QRCode;
