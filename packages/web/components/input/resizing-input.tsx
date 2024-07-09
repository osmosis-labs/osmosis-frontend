import classNames from "classnames";
import { useEffect, useRef } from "react";

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
  disabled,
}) => {
  const ref = useRef<HTMLInputElement | null>(null);
  const prefixRef = useRef<HTMLSpanElement | null>(null);
  const suffixRef = useRef<HTMLSpanElement | null>(null);
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    onChange(event.target.value);
  };

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const input = ref.current;
    const inputSizer = ref.current.parentNode! as HTMLDivElement;
    const wrapper = inputSizer.parentNode!.parentNode! as HTMLDivElement;
    const wrapperWidth = wrapper.offsetWidth;
    const prefixWidth = prefixRef.current?.offsetWidth ?? 0;
    const suffixWidth = suffixRef.current?.offsetWidth ?? 0;
    const tickerWidth = prefixWidth + suffixWidth;
    const minScale = (disableResize ? 32 : 16) / 96;

    const resize = () => {
      inputSizer.dataset.value = input.value || "0";
      const contentWidth = inputSizer.offsetWidth + tickerWidth;
      const scale = Math.min(
        1,
        Math.max(minScale, wrapperWidth / contentWidth)
      );
      wrapper.style.transform = disableResize ? `scale(1)` : `scale(${scale})`;
    };

    inputSizer.style.maxWidth = `650px`;
    resize();
    input.addEventListener("input", resize);

    return () => {
      input.removeEventListener("input", resize);
    };
  }, [ref, prefixRef, suffixRef, disableResize]);

  return (
    <div className="block w-full max-w-[375px]">
      <div className="flex-start relative mx-auto flex w-full flex-1 origin-center justify-center text-center ">
        <div className={classNames("flex items-center justify-center")}>
          {prefix && (
            <span className="self-center" ref={prefixRef}>
              {prefix}
            </span>
          )}
          <div className="relative flex items-center justify-center self-center overflow-hidden">
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
              disabled={disabled}
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
