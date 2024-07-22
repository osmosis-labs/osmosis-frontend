import * as Sentry from "@sentry/nextjs";
import React, { ErrorInfo, FunctionComponent } from "react";
import {
  ErrorBoundary as ReactErrorBoundary,
  ErrorBoundaryProps,
} from "react-error-boundary";

export const ErrorBoundary: FunctionComponent<ErrorBoundaryProps> = ({
  onError: onErrorProp,
  ...props
}) => {
  const handleError = (error: Error, info: ErrorInfo) => {
    Sentry.captureException(error);
    onErrorProp?.(error, info);
  };

  return <ReactErrorBoundary {...props} onError={handleError} />;
};
