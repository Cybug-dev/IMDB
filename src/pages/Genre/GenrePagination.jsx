import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./GenrePagination.scss";

/**
 * Helper function to calculate a sliding window of visible page numbers.
 * Example: If currentPage is 5, it might return [3, 4, 5, 6, 7].
 */
const getVisiblePages = (currentPage, totalPages) => {
  const windowSize = 5; // Maximum number of page buttons to display at once
  const halfWindow = Math.floor(windowSize / 2);
  
  // Calculate the starting page number, ensuring it doesn't drop below 1 
  // and stays correctly positioned when approaching the final pages.
  const start = Math.max(1, Math.min(currentPage - halfWindow, totalPages - windowSize + 1));
  
  // Calculate the ending page number, ensuring it doesn't exceed totalPages
  const end = Math.min(totalPages, start + windowSize - 1);

  // Generate an array of numbers from 'start' to 'end' (e.g., [1, 2, 3, 4, 5])
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
  // Performance optimization: recalculate visible page numbers only when 
  // the current page or total page count actually changes.
  const visiblePages = useMemo(
    () => getVisiblePages(currentPage, totalPages),
    [currentPage, totalPages],
  );

  // Guard clause: If there's only 1 page (or none), pagination is useless, so don't render anything.
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="genre-pagination" aria-label="Genre movie pages">
      
      {/* "Previous" Button: Decrements the page count when clicked */}
      <button
        type="button"
        className="genre-pagination__button genre-pagination__button--step"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || !canGoPrevious} // Disabled if loading or if we are on the first page
        aria-label="Go to previous page"
      >
        <ChevronLeft aria-hidden="true" />
        <span>Previous</span>
      </button>

      <div className="genre-pagination__pages" role="group" aria-label="Page numbers">
        
        {/* Conditional Rendering: If page 1 is hidden behind the sliding window, 
            show a shortcut button to page 1 followed by an ellipsis (...) */}
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

        {/* Dynamically render the calculated list of middle page numbers */}
        {visiblePages.map((pageNumber) => (
          <button
            type="button"
            key={pageNumber} // Unique key required by React for dynamic lists
            className="genre-pagination__button genre-pagination__button--number"
            onClick={() => onPageChange(pageNumber)}
            // Deactivate the button if it matches the page the user is currently looking at
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

        {/* Conditional Rendering: If the last page isn't part of our sliding window, 
            show an ellipsis (...) followed by a shortcut button to the final page */}
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

      {/* "Next" Button: Increments the page count when clicked */}
      <button
        type="button"
        className="genre-pagination__button genre-pagination__button--step"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || !canGoNext} // Disabled if loading or if we are on the final page
        aria-label="Go to next page"
      >
        <span>Next</span>
        <ChevronRight aria-hidden="true" />
      </button>
    </nav>
  );
}

export default GenrePagination;