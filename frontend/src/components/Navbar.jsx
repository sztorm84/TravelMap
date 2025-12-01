import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "../styles/Navbar.css";
import Logo from "../assets/earth-spin.gif";

export default function Navbar() {
  const { user, logoutUser } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar-header">
      <div className="logo">
        <Link to="/" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <img src={Logo} alt="Logo" style={{ width: "50px", height: "50px" }} />
            <span>TravelMap</span>
        </Link>
      </div>

      <nav className={`nav ${menuOpen ? "open" : ""}`}>
        <ul className="nav-list">
          
          <li><Link to="/" onClick={closeMenu}>Strona główna</Link></li>
          
          {!user ? (
            <>
              <li><Link to="/about" onClick={closeMenu}>O projekcie</Link></li>
              <li><Link to="/map" onClick={closeMenu}>Mapa</Link></li>
              <li>
                <Link to="/login" onClick={closeMenu}>Zaloguj</Link>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/map" onClick={closeMenu}>Moja Mapa</Link></li>
              <li><Link to="/dashboard" onClick={closeMenu}>Panel</Link></li>

              <li>
                <Link to="#" onClick={() => { logoutUser(); closeMenu(); }}>
                    Wyloguj
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div
        className={`hamburger ${menuOpen ? "active" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    </header>
  );
}