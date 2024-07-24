export enum HTTPMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export interface ClientErrorResponse {
  message: string;
  error: Error;
}

export class ApiClientError<Data = unknown> extends Error {
  status: number;
  data: Data;
  response: Response;
  constructor({
    message,
    data,
    response,
  }: {
    message: string;
    data: Data;
    response: Response;
  }) {
    super(message);
    this.status = response.status;
    this.data = data;
    this.response = response;
  }
}

export interface ClientOptions extends RequestInit {
  data?: Record<string, any>;
}

const UNEXPECTED_ERROR_MESSAGE = "An unexpected error occurred.";

function getErrorMessage({
  message = UNEXPECTED_ERROR_MESSAGE,
}: {
  message?: string;
} = {}) {
  if (message.endsWith(".")) {
    message = message.slice(0, -1);
  }
  if (message.startsWith("Fetch error. ")) {
    message = message.replace("Fetch error. ", "").trim();
  }
  return `Fetch error. ${message}.`;
}

export async function apiClient<T>(
  endpoint: string,
  { data, headers: customHeaders, ...customConfig }: ClientOptions = {}
): Promise<T> {
  const config: RequestInit = {
    method: data ? HTTPMethod.POST : HTTPMethod.GET,
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      ...(data && { "Content-Type": "application/json" }),
      ...customHeaders,
    },
    ...customConfig,
  };

  return fetch(endpoint, config).then(async (response) => {
    try {
      let data: any;

      if (response.status === 502) {
        throw new ApiClientError({
          message: "Bad Gateway",
          data: {},
          response,
        });
      }

      try {
        data = await response.json();
      } catch (e) {
        throw new ApiClientError({
          message: `JSON parse error: ${e}`,
          data: {
            url: endpoint,
          },
          response,
        });
      }

      // Look for specific errors returned from OK response
      if (response.ok && typeof data === "object") {
        // Cosmos chains return a code if there's an error
        if ("code" in data && Boolean(data.code)) {
          throw new ApiClientError({
            message: `A chain error has occurred. Code: ${data.code}. Message: ${data.message}`,
            data,
            response,
          });
        }

        if ("status_code" in data && data.status_code >= 400) {
          throw new ApiClientError({
            message: getErrorMessage({ message: data?.message }),
            data,
            response,
          });
        }

        return data;
      } else {
        throw new ApiClientError({
          message: getErrorMessage({ message: data?.message ?? data.error }),
          data,
          response,
        });
      }
    } catch (e) {
      const error = e as Error | ApiClientError;

      // may contain sensitive data and will be thrown away anyways because of error
      if (config.headers) delete config.headers;

      console.error("Fetch Error. Info:", {
        endpoint,
        config,
        status: response.status,
        exception: e,
      });

      if (e instanceof ApiClientError) {
        throw e;
      }

      throw new ApiClientError({
        message: getErrorMessage({
          message:
            error.message === "Unexpected token < in JSON at position 0"
              ? undefined
              : error.message,
        }),
        data: {},
        response,
      });
    }
  });
}
