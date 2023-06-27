import { FunctionComponent, useMemo } from "react";

type Props = Readonly<{
  error: unknown;
}>;

export const ErrorCard: FunctionComponent<Props> = ({ error }) => {
  const message = useMemo(() => {
    if (error instanceof Error) {
      return error.message;
    } else if (typeof error === "string") {
      return error;
    } else {
      return "Unknown error";
    }
  }, [error]);

  return <div className="text-center">{message}</div>;
};
