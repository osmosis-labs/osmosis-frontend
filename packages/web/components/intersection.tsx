import { useEffect, useRef } from "react";

interface IntersectionProps extends React.HTMLAttributes<HTMLDivElement> {
  onVisible: () => void;
}

const Intersection = ({ onVisible, ...props }: IntersectionProps) => {
  const target = useRef<HTMLDivElement>(null);
  const onVisibleRef = useRef(onVisible);

  useEffect(() => {
    onVisibleRef.current = onVisible;
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((e) => e.isIntersecting);
        if (isIntersecting) {
          onVisibleRef.current();
        }
      },
      { threshold: 0 }
    );

    observer.observe(target.current!);

    return () => observer.disconnect();
  }, []);

  return <div ref={target} {...props} />;
};

export default Intersection;
