import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./GenrePagination.scss";

const getVisiblePages = (currentPage, totalPages) => {
  const windowSize = 5;
  const halfWindow = Math.floor(windowSize / 2);
  const start = Math.max(1, Math.min(currentPage - halfWindow, totalPages - windowSize + 1));
  const end = Math.min(totalPages, start + windowSize - 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

function GenrePagination({
  canGoNext,
  canGoPrevious,
  currentPage,
  disabled = false,
  onPageChange,
  totalPages,
}) {
  const visiblePages = useMemo(
    () => getVisiblePages(currentPage, totalPages),
    [currentPage, totalPages],
  );

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="genre-pagination" aria-label="Genre movie pages">
      <button
        type="button"
        className="genre-pagination__button genre-pagination__button--step"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || !canGoPrevious}
        aria-label="Go to previous page"
      >
        <ChevronLeft aria-hidden="true" />
        <span>Previous</span>
      </button>

      <div className="genre-pagination__pages" role="group" aria-label="Page numbers">
        {visiblePages[0] > 1 && (
          <>
            <button
              type="button"
              className="genre-pagination__button genre-pagination__button--number"
              onClick={() => onPageChange(1)}
              disabled={disabled}
              aria-label="Go to page 1"
            >
              1
            </button>
            <span className="genre-pagination__ellipsis" aria-hidden="true">
              ...
            </span>
          </>
        )}

        {visiblePages.map((pageNumber) => (
          <button
            type="button"
            key={pageNumber}
            className="genre-pagination__button genre-pagination__button--number"
            onClick={() => onPageChange(pageNumber)}
            disabled={disabled || pageNumber === currentPage}
            aria-current={pageNumber === currentPage ? "page" : undefined}
            aria-label={
              pageNumber === currentPage
                ? `Current page, page ${pageNumber}`
                : `Go to page ${pageNumber}`
            }
          >
            {pageNumber}
          </button>
        ))}

        {visiblePages.at(-1) < totalPages && (
          <>
            <span className="genre-pagination__ellipsis" aria-hidden="true">
              ...
            </span>
            <button
              type="button"
              className="genre-pagination__button genre-pagination__button--number"
              onClick={() => onPageChange(totalPages)}
              disabled={disabled}
              aria-label={`Go to page ${totalPages}`}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        type="button"
        className="genre-pagination__button genre-pagination__button--step"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || !canGoNext}
        aria-label="Go to next page"
      >
        <span>Next</span>
        <ChevronRight aria-hidden="true" />
      </button>
    </nav>
  );
}

export default GenrePagination;
