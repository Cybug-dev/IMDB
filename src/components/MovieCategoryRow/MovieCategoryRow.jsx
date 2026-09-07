import { Children, useId, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHorizontalScroll } from "./useHorizontalScroll";
import "./MovieCategoryRow.scss";

function MovieCategoryRow({ children, label, className = "", viewportRef }) {
  const localRef = useRef(null);
  const rowRef = viewportRef ?? localRef;
  const rowId = useId();
  const { canScrollLeft, canScrollRight, scroll, onKeyDown } =
    useHorizontalScroll(rowRef, Children.count(children));

  return (
    <div
      className="movie-category-row"
      data-scrollable={canScrollLeft || canScrollRight}
      data-can-scroll-left={canScrollLeft}
      data-can-scroll-right={canScrollRight}
    >
      <div
        ref={rowRef}
        id={rowId}
        className={`movie-category-row__viewport ${className}`}
        role="region"
        aria-label={`${label} movie row`}
        aria-keyshortcuts="ArrowLeft ArrowRight"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
      <button
        type="button"
        className="movie-category-row__arrow movie-category-row__arrow--left"
        aria-label={`Scroll ${label} left`}
        aria-controls={rowId}
        disabled={!canScrollLeft}
        onClick={() => scroll(-1)}
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="movie-category-row__arrow movie-category-row__arrow--right"
        aria-label={`Scroll ${label} right`}
        aria-controls={rowId}
        disabled={!canScrollRight}
        onClick={() => scroll(1)}
      >
        <ChevronRight size={20} aria-hidden="true" />
      </button>
    </div>
  );
}

export default MovieCategoryRow;
