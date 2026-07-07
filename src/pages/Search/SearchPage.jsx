import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { getSearchResultPath } from "../../components/searchEngine/searchApi";
import { useSearchResults } from "../../components/searchEngine/useSearch";

function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = useMemo(
    () => searchParams.get("query")?.trim() ?? "",
    [searchParams],
  );
  const { data, isError, isLoading } = useSearchResults({ query });
  const results = data?.results ?? [];

  return (
    <main className="search-page">
      <div className="search-page__inner">
        <header className="search-page__header">
          <p className="search-page__eyebrow">Search</p>
          <h1 className="search-page__title">
            {query ? `Results for "${query}"` : "Search results"}
          </h1>
        </header>

        {isLoading && <p className="search-page__status">Searching...</p>}
        {isError && (
          <p className="search-page__status">Search is unavailable right now.</p>
        )}
        {!query && <p className="search-page__status">Enter a search from the header.</p>}

        {!isLoading && !isError && query && results.length === 0 && (
          <p className="search-page__status">No results found.</p>
        )}

        {results.length > 0 && (
          <div className="search-page__results">
            {results.map((result) => (
              <button
                className="search-page__result"
                type="button"
                key={`${result.mediaType}-${result.id}`}
                onClick={() => navigate(getSearchResultPath(result))}
              >
                <span className="search-page__poster" aria-hidden="true">
                  {result.posterUrl ? (
                    <img src={result.posterUrl} alt="" loading="lazy" />
                  ) : (
                    <span>{result.title.charAt(0)}</span>
                  )}
                </span>

                <span className="search-page__result-body">
                  <span className="search-page__result-title">{result.title}</span>
                  <span className="search-page__result-meta">
                    <span>{result.mediaTypeLabel}</span>
                    {result.primaryGenre && <span>{result.primaryGenre}</span>}
                    <span className="search-page__rating">
                      <FontAwesomeIcon icon={faStar} />
                      <span>{result.ratingLabel}</span>
                    </span>
                  </span>
                  {result.overview && (
                    <span className="search-page__overview">{result.overview}</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default SearchPage;
