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

interface ClientOptions extends RequestInit {
  data?: Record<string, any>;
}

const UNEXPECTED_ERROR_MESSAGE = "An unexpected error occurred.";

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
      const data = await response.json();

      if (response.ok) {
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
            message: data?.message ?? UNEXPECTED_ERROR_MESSAGE,
            data,
            response,
          });
        }

        return data;
      } else {
        throw new ApiClientError({
          message: data?.message ?? UNEXPECTED_ERROR_MESSAGE,
          data,
          response,
        });
      }
    } catch (e) {
      const error = e as Error | ApiClientError;

      if (e instanceof ApiClientError) {
        throw e;
      }

      throw new ApiClientError({
        message:
          error.message === "Unexpected token < in JSON at position 0"
            ? UNEXPECTED_ERROR_MESSAGE
            : error.message,
        data: {},
        response,
      });
    }
  });
}
