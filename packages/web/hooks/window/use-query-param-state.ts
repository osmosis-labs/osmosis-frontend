import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";

type QueryParamValue =
  | string
  | number
  | boolean
  | readonly string[]
  | readonly number[]
  | readonly boolean[]
  | null
  | undefined;

/** Emulates `React.useState` but uses next/router to store state in URL query params.
 *  Only sets from `defaultValue` if it's not present in the query params. */
export function useQueryParamState(
  key: string,
  defaultValue?: QueryParamValue
): [QueryParamValue | undefined, (value: QueryParamValue) => void] {
  const router = useRouter();
  const { query: queryParams } = router;
  const queryParamValue = queryParams[key];

  const setQueryParam = useCallback(
    (value: QueryParamValue) => {
      if (queryParams[key] === value) return;
      router.push({
        query: {
          ...queryParams,
          [key]: value,
        },
      });
    },
    [router, queryParams, key]
  );

  // set initial state in query params, if it's not there already
  useEffect(() => {
    if (router.isReady && defaultValue && !queryParamValue) {
      setQueryParam(defaultValue);
    }
  }, [setQueryParam, defaultValue, queryParamValue, router.isReady]);

  return [queryParamValue, setQueryParam];
}
