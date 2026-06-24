import { memo, useId, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

function HeaderSearch({ className = "", inputId }) {
  const [query, setQuery] = useState("");
  const reactInputId = useId();
  const searchInputId = inputId ?? `header-search-${reactInputId}`;

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
      // TODO: wire to search results page
  };

  return (
    <form
      className={`header-search${className ? ` ${className}` : ""}`}
      role="search"
      onSubmit={handleSubmit}
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
      />
      <button className="header-search__button" type="submit" aria-label="Search">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="header-search__icon" />
      </button>
    </form>
  );
}

export default memo(HeaderSearch);
