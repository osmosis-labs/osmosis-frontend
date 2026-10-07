import {
  CSSProperties,
  InputHTMLAttributes,
  MutableRefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const sizerStyle: CSSProperties = {
  position: "absolute",
  visibility: "hidden",
  height: 0,
  overflow: "hidden",
  whiteSpace: "pre",
  pointerEvents: "none",
};

interface AutosizeInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue"
> {
  value: string;
  /** className/style apply to the wrapper, as with react-input-autosize. */
  inputClassName?: string;
  inputStyle?: CSSProperties;
  inputRef?:
    | ((input: HTMLInputElement | null) => void)
    | MutableRefObject<HTMLInputElement | null>;
  minWidth?: number;
  extraWidth?: number;
  placeholderIsMinWidth?: boolean;
  onAutosize?: (width: number) => void;
}

function assignInputRef(
  ref: AutosizeInputProps["inputRef"],
  node: HTMLInputElement | null
) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

/** Controlled text input: measurement never rewrites its value or selection.
 * Width is content-box (padding/borders are provided by the input's CSS).
 * The extra two pixels leave room for the caret, matching the former dependency.
 */
export function AutosizeInput({
  value,
  className,
  style,
  inputClassName,
  inputStyle,
  inputRef,
  minWidth = 1,
  extraWidth,
  placeholder,
  placeholderIsMinWidth = false,
  onAutosize,
  type = "text",
  ...inputProps
}: AutosizeInputProps) {
  const input = useRef<HTMLInputElement | null>(null);
  const sizer = useRef<HTMLDivElement | null>(null);
  const placeholderSizer = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(minWidth);
  const previousWidth = useRef(width);

  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      input.current = node;
      assignInputRef(inputRef, node);
    },
    [inputRef]
  );

  const measure = useCallback(() => {
    if (!input.current || !sizer.current) return;
    const computed = window.getComputedStyle(input.current);
    for (const node of [sizer.current, placeholderSizer.current]) {
      if (!node) continue;
      // Copy on every measurement, including responsive styles and late fonts.
      node.style.fontFamily = computed.fontFamily;
      node.style.fontSize = computed.fontSize;
      node.style.fontWeight = computed.fontWeight;
      node.style.fontStyle = computed.fontStyle;
      node.style.fontStretch = computed.fontStretch;
      node.style.fontVariant = computed.fontVariant;
      node.style.letterSpacing = computed.letterSpacing;
      node.style.textTransform = computed.textTransform;
    }
    const textWidth = sizer.current.scrollWidth;
    const placeholderWidth =
      placeholder && (!value || placeholderIsMinWidth)
        ? (placeholderSizer.current?.scrollWidth ?? 0)
        : 0;
    setWidth(
      Math.max(
        minWidth,
        Math.max(textWidth, placeholderWidth) +
          2 +
          (extraWidth ?? (type === "number" ? 16 : 0))
      )
    );
  }, [value, placeholder, placeholderIsMinWidth, minWidth, extraWidth, type]);

  // Measure after every commit so changes to classes/inherited styles are read.
  useIsomorphicLayoutEffect(() => {
    measure();
  });

  useIsomorphicLayoutEffect(() => {
    if (previousWidth.current !== width) {
      previousWidth.current = width;
      onAutosize?.(width);
    }
  }, [width, onAutosize]);

  useEffect(() => {
    let active = true;
    const remeasure = () => {
      if (active) measure();
    };
    window.addEventListener("resize", remeasure);
    const fonts = document.fonts;
    fonts?.addEventListener("loadingdone", remeasure);
    void fonts?.ready.then(remeasure);
    // Also remeasure when an initially hidden input becomes visible.
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(remeasure);
    if (input.current) observer?.observe(input.current);
    return () => {
      active = false;
      window.removeEventListener("resize", remeasure);
      fonts?.removeEventListener("loadingdone", remeasure);
      observer?.disconnect();
    };
  }, [measure]);

  return (
    <div className={className} style={{ display: "inline-block", ...style }}>
      <input
        {...inputProps}
        ref={setInputRef}
        type={type}
        value={value}
        placeholder={placeholder}
        className={inputClassName}
        style={{ ...inputStyle, boxSizing: "content-box", width }}
      />
      <div ref={sizer} aria-hidden="true" style={sizerStyle}>
        {value}
      </div>
      {placeholder && (
        <div ref={placeholderSizer} aria-hidden="true" style={sizerStyle}>
          {placeholder}
        </div>
      )}
    </div>
  );
}
