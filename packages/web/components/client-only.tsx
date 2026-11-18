import { PropsWithChildren } from "react";

import { useIsClient } from "~/hooks/use-is-client";

export const ClientOnly = (
  props: PropsWithChildren<{ className?: string }>
) => {
  const isClient = useIsClient();

  if (!isClient) {
    return null;
  }

  return <div {...props} />;
};
