import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

function HeaderSearch() {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <form className="header-search" role="search" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="header-search-input">
        Search movies, actors, directors
      </label>
      <input
        id="header-search-input"
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

export default HeaderSearch;
