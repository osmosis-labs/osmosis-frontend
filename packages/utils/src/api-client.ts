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

function getErrorMessage({
  url,
  message = "An unexpected error occurred.",
}: {
  url: string;
  message?: string;
}) {
  const timestamp = new Date().toISOString();
  return `Fetch error at ${timestamp}. ${message}. URL: ${url}`;
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
            message: getErrorMessage({ message: data?.message, url: endpoint }),
            data,
            response,
          });
        }

        return data;
      } else {
        throw new ApiClientError({
          message: getErrorMessage({ message: data?.message, url: endpoint }),
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
            ? getErrorMessage({ url: endpoint })
            : getErrorMessage({ message: error.message, url: endpoint }),
        data: {},
        response,
      });
    }
  });
}
