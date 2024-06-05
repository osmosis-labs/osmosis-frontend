import classNames from "classnames";
import { FC, useCallback, useEffect, useRef, useState } from "react";

export interface DynamicSizeInputProps<T = string> {
  value: T;
  onChange: (newValue: T) => void;
  className?: string;
  type: "number" | "string";
  placeholder?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const DynamicSizeInput: FC<DynamicSizeInputProps> = ({
  value,
  onChange,
  className,
  type,
  placeholder,
  disabled,
  onClick,
}) => {
  const [width, setWidth] = useState(0);
  const span = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!span.current) return;
    setWidth(span.current.offsetWidth);
  }, [value, disabled]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  return (
    <div>
      <input
        onClick={onClick}
        disabled={disabled}
        type={type}
        value={value ?? placeholder}
        onChange={handleChange}
        placeholder={placeholder}
        className={classNames(className, { "select-none": disabled })}
        style={{ width, maxWidth: "100%" }}
      />
      <span className={classNames(className, "absolute opacity-0")} ref={span}>
        {value && value.length > 0 ? value : placeholder}
      </span>
    </div>
  );
};
