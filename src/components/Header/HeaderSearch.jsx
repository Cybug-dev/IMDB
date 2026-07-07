import { memo, useCallback, useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { getSearchResultPath } from "../search/searchApi";
import { useHeaderSearch, useSearchHistory } from "../search/useSearch";

function HeaderSearch({ className = "", inputId }) {
  const [query, setQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const reactInputId = useId();
  const searchInputId = inputId ?? `header-search-${reactInputId}`;
  const {
    isDebouncing,
    isReadyToSearch,
    normalizedInput,
    searchQuery,
    suggestionsQuery,
  } = useHeaderSearch(query);
  const { history, saveSearch } = useSearchHistory();
  const isSearching = Boolean(normalizedInput);
  const resultItems = isSearching
    ? searchQuery.data ?? []
    : suggestionsQuery.data ?? [];
  const shouldShowDropdown =
    isDropdownOpen &&
    (isSearching
      ? isReadyToSearch
      : resultItems.length > 0 ||
        history.length > 0 ||
        suggestionsQuery.isLoading ||
        suggestionsQuery.isError);

  useEffect(() => {
    if (!isDropdownOpen) return undefined;

    const handlePointerDown = (event) => {
      if (searchRef.current?.contains(event.target)) return;

      setIsDropdownOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isDropdownOpen]);

  const handleChange = (e) => {
    setQuery(e.target.value);
    setIsDropdownOpen(true);
  };

  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  const goToSearchPage = useCallback(
    (searchTerm) => {
      const submittedQuery = searchTerm.trim();

      if (!submittedQuery) return;

      saveSearch(submittedQuery);
      closeDropdown();
      navigate(`/search?query=${encodeURIComponent(submittedQuery)}`);
    },
    [closeDropdown, navigate, saveSearch],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    goToSearchPage(query);
  };

  const handleResultClick = (result) => {
    saveSearch(normalizedInput || result.title);
    setQuery("");
    closeDropdown();
    navigate(getSearchResultPath(result));
  };

  const handleHistoryClick = (searchTerm) => {
    setQuery(searchTerm);
    goToSearchPage(searchTerm);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown();
    }
  };

  return (
    <form
      ref={searchRef}
      className={`header-search${className ? ` ${className}` : ""}`}
      role="search"
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
    >
      <label className="sr-only" htmlFor={searchInputId}>
        Search movies, actors, directors
      </label>
      <input
        id={searchInputId}
        type="text"
        placeholder="Search movies, actors, directors..."
        value={query}
        onChange={handleChange}
        onFocus={() => setIsDropdownOpen(true)}
        aria-expanded={shouldShowDropdown}
        aria-controls={`${searchInputId}-dropdown`}
        autoComplete="off"
      />
      <button className="header-search__button" type="submit" aria-label="Search">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="header-search__icon" />
      </button>

      {shouldShowDropdown && (
        <div
          id={`${searchInputId}-dropdown`}
          className="header-search__dropdown"
          role="listbox"
        >
          {!isSearching && history.length > 0 && (
            <div className="header-search__history" aria-label="Recent searches">
              {history.slice(0, 6).map((searchTerm) => (
                <button
                  className="header-search__history-item"
                  type="button"
                  key={searchTerm}
                  onClick={() => handleHistoryClick(searchTerm)}
                >
                  {searchTerm}
                </button>
              ))}
            </div>
          )}

          {!isSearching && suggestionsQuery.isLoading && (
            <p className="header-search__status">Loading popular picks...</p>
          )}

          {isSearching && isReadyToSearch && (searchQuery.isLoading || isDebouncing) && (
            <p className="header-search__status">Searching...</p>
          )}

          {((isSearching && searchQuery.isError) ||
            (!isSearching && suggestionsQuery.isError)) && (
            <p className="header-search__status">Search is unavailable right now.</p>
          )}

          {resultItems.length > 0 && (
            <ul className="header-search__results">
              {resultItems.map((result) => (
                <li className="header-search__result-item" key={`${result.mediaType}-${result.id}`}>
                  <button
                    className="header-search__result"
                    type="button"
                    role="option"
                    onClick={() => handleResultClick(result)}
                  >
                    <span className="header-search__poster" aria-hidden="true">
                      {result.posterUrl ? (
                        <img src={result.posterUrl} alt="" loading="lazy" />
                      ) : (
                        <span>{result.title.charAt(0)}</span>
                      )}
                    </span>

                    <span className="header-search__result-body">
                      <span className="header-search__result-title">{result.title}</span>
                      <span className="header-search__result-meta">
                        <span>{result.mediaTypeLabel}</span>
                        {result.subtitle && <span>{result.subtitle}</span>}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {isSearching &&
            isReadyToSearch &&
            !searchQuery.isLoading &&
            !searchQuery.isError &&
            resultItems.length === 0 && (
              <p className="header-search__status">No matches found.</p>
            )}
        </div>
      )}
    </form>
  );
}

export default memo(HeaderSearch);
