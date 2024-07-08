import classNames from "classnames";
import { useMemo, useRef } from "react";

interface ResizingInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange: (value: string) => void;
  value: string;
  prefix?: string;
  suffix?: string;
  inputRef?: React.RefObject<HTMLInputElement> | undefined;
  disableResize?: boolean;
}

export const ResizingInput: React.FC<ResizingInputProps> = ({
  onChange,
  value,
  prefix,
  suffix,
  className,
  placeholder,
  disableResize,
}) => {
  const ref = useRef<any>(null);
  const prefixRef = useRef<any>(null);
  const suffixRef = useRef<any>(null);
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    onChange(event.target.value);
  };

  const [scale, inputMaxWidth] = useMemo(() => {
    if (!ref.current || disableResize) return [1, 360];
    const inputSizer = ref.current.parentNode;
    const wrapperWidth = inputSizer.parentNode.parentNode.offsetWidth;
    const prefixWidth = prefixRef.current?.offsetWidth ?? 0;
    const suffixWidth = suffixRef.current?.offsetWidth ?? 0;
    const tickerWidth = prefixWidth + suffixWidth;

    const minScale = 16 / 96;
    const inputMaxWidth = (0.5 / minScale) * wrapperWidth - tickerWidth;
    const contentWidth = inputSizer.offsetWidth + tickerWidth;
    const scale = Math.min(1, Math.max(minScale, wrapperWidth / contentWidth));

    return [scale, inputMaxWidth];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, value, disableResize]);
  return (
    <div className="block max-w-[375px]">
      <div
        className="flex-start relative mx-auto flex w-full flex-1 origin-center justify-center text-center "
        style={{ transform: `scale(${scale})` }}
      >
        <div
          className={classNames("flex items-center justify-center", {
            "max-w-[375px]": disableResize,
          })}
        >
          {prefix && (
            <span className="self-center" ref={prefixRef}>
              {prefix}
            </span>
          )}
          <div
            style={{
              maxWidth: disableResize ? undefined : `${inputMaxWidth}px`,
            }}
            className="relative flex items-center justify-center self-center overflow-hidden"
          >
            <span className="invisible">
              {value.length > 0 ? value : placeholder}
            </span>
            <input
              type="number"
              className={`${className} absolute m-0 h-full w-full bg-transparent p-0 outline-0`}
              value={value}
              onChange={handleInputChange}
              placeholder={placeholder}
              ref={ref}
            />
          </div>
          {suffix && (
            <span className="self-center pl-2" ref={suffixRef}>
              {suffix}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
