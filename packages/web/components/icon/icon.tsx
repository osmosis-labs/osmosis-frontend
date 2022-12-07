import { useMemo } from "react";
import { IconProps } from "./types";
import Star from "./icons/star";
import Image from "next/image";

const Icon: React.FC<IconProps> = ({
  color = "#fff",
  name,
  onClick,
  size = 24,
}) => {
  const Child = useMemo(() => {
    switch (name) {
      case "star":
        return <Star color={color} size={size} />;

      default:
        return null;
    }
  }, [color, name, size]);
  return (
    // <div
    //   className="inline-flex"
    //   onClick={onClick}
    //   style={{
    //     cursor: onClick ? "pointer" : "default",
    //     height: `${size}px`,
    //     width: `${size}px`,
    //   }}
    // >
    <Image alt={name} src={`/icons/${name}.svg`} height={size} width={size} />
    // {/* {Child} */}
    // </div>
  );
};

export default Icon;
