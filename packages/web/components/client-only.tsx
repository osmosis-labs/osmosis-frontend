import { FunctionComponent, useEffect, useState } from "react";

const ClientOnly: FunctionComponent<{ className?: string; children?: any }> = (
  props
) => {
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
