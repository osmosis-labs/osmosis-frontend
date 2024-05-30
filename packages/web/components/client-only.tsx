import { PropsWithChildren, useEffect, useState } from "react";

const ClientOnly = (props: PropsWithChildren<{ className?: string }>) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <div {...props} />;
};

export default ClientOnly;
