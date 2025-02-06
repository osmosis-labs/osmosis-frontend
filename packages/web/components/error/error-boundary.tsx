import React, { ErrorInfo, FunctionComponent } from "react";
import {
  ErrorBoundary as ReactErrorBoundary,
  ErrorBoundaryProps,
} from "react-error-boundary";

import { captureError } from "~/utils/error";

export const ErrorBoundary: FunctionComponent<ErrorBoundaryProps> = ({
  onError: onErrorProp,
  ...props
}) => {
  const handleError = (error: Error, info: ErrorInfo) => {
    captureError(error);
    onErrorProp?.(error, info);
  };

  return <ReactErrorBoundary {...props} onError={handleError} />;
};
