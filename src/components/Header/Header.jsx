import HeaderLeft from "./HeaderLeft";
import HeaderSearch from "./HeaderSearch";
import HeaderRight from "./HeaderRight";

function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <HeaderLeft />
        <HeaderSearch />
        <HeaderRight />
      </div>
    </header>
  );
}

export default Header;
