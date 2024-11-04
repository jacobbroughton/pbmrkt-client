import { useSearchParams as useSearchParamsReactRouter } from "react-router-dom";

export function useSearchParams() {
  const [searchParams, setSearchParams] = useSearchParamsReactRouter();

  function addSearchParam(key: string, value: string) {
    const newSearchParams = new URLSearchParams(searchParams);

    newSearchParams.set(key, value);

    setSearchParams(newSearchParams);
  }

  return { searchParams, addSearchParam };
}
