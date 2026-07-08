import { useCallback, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  HEADER_SEARCH_RESULT_LIMIT,
  SEARCH_HISTORY_LIMIT,
  fetchHeaderSuggestions,
  fetchMultiSearch,
  getHeaderSearchLookupTerm,
  normalizeSearchTerm,
} from "./searchApi";

const DEBOUNCE_MS = 400;
const HISTORY_STORAGE_KEY = "imdb.search.history.v1";
const SEARCH_STALE_TIME = 1000 * 60 * 5;
const SUGGESTIONS_STALE_TIME = 1000 * 60 * 10;

export const searchQueryKeys = {
  all: ["tmdb", "search"],
  header: (query) => [...searchQueryKeys.all, "header", query],
  suggestions: () => [...searchQueryKeys.all, "suggestions"],
  results: (query, page) => [...searchQueryKeys.all, "results", query, page],
};

export const useDebouncedValue = (value, delay = DEBOUNCE_MS) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [delay, value]);

  return debouncedValue;
};

const readSearchHistory = () => {
  try {
    const storedHistory = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    const parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];

    return Array.isArray(parsedHistory) ? parsedHistory.slice(0, SEARCH_HISTORY_LIMIT) : [];
  } catch {
    return [];
  }
};

export const useSearchHistory = () => {
  const [history, setHistory] = useState(readSearchHistory);

  useEffect(() => {
    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Search history is a convenience cache; the app can run without it.
    }
  }, [history]);

  const saveSearch = useCallback((value) => {
    const searchTerm = normalizeSearchTerm(value);

    if (!searchTerm) return;

    setHistory((currentHistory) => {
      const nextHistory = [
        searchTerm,
        ...currentHistory.filter(
          (item) => item.toLowerCase() !== searchTerm.toLowerCase(),
        ),
      ];

      return nextHistory.slice(0, SEARCH_HISTORY_LIMIT);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    clearHistory,
    history,
    saveSearch,
  };
};

export const useHeaderSearch = (inputValue) => {
  const normalizedInput = useMemo(
    () => normalizeSearchTerm(inputValue),
    [inputValue],
  );
  const debouncedInput = useDebouncedValue(inputValue);
  const headerLookupTerm = useMemo(
    () => getHeaderSearchLookupTerm(debouncedInput),
    [debouncedInput],
  );
  const shouldSearch = Boolean(headerLookupTerm);
  const suggestionsQuery = useQuery({
    queryKey: searchQueryKeys.suggestions(),
    queryFn: () => fetchHeaderSuggestions(),
    enabled: !normalizedInput,
    staleTime: SUGGESTIONS_STALE_TIME,
    gcTime: 1000 * 60 * 2,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const searchQuery = useQuery({
    queryKey: searchQueryKeys.header(headerLookupTerm),
    queryFn: () => fetchMultiSearch({ query: headerLookupTerm }),
    enabled: shouldSearch,
    placeholderData: keepPreviousData,
    select: (data) => data.results.slice(0, HEADER_SEARCH_RESULT_LIMIT),
    staleTime: SEARCH_STALE_TIME,
  });

  return {
    headerLookupTerm,
    isDebouncing: Boolean(normalizedInput) && getHeaderSearchLookupTerm(inputValue) !== headerLookupTerm,
    isReadyToSearch: Boolean(getHeaderSearchLookupTerm(inputValue)),
    normalizedInput,
    searchQuery,
    suggestionsQuery,
  };
};

export const useSearchResults = ({ query, page = 1 }) => {
  const normalizedQuery = useMemo(() => normalizeSearchTerm(query), [query]);

  return useQuery({
    queryKey: searchQueryKeys.results(normalizedQuery, page),
    queryFn: () => fetchMultiSearch({ query: normalizedQuery, page }),
    enabled: Boolean(normalizedQuery),
    placeholderData: keepPreviousData,
    staleTime: SEARCH_STALE_TIME,
  });
};
