import { useSearchParams as useSearchParamsReactRouter } from "react-router-dom";

export function useSearchParams() {
  const [searchParams, setSearchParams] = useSearchParamsReactRouter();

  function addSearchParams(keyValuePairs: [string, string | number | boolean][]) {
    const newSearchParams = new URLSearchParams(searchParams);

    keyValuePairs.forEach(([key, value]) => {
      newSearchParams.set(key, `${value}`);
    });

    setSearchParams(newSearchParams);
  }

  return { searchParams, addSearchParams };
}
