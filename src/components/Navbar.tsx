import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../hooks/authSession";
import Logout from "../hooks/logout";

function Navbar() {
  let navigate = useNavigate();

  async function handleLogout() {
    await Logout();
    navigate("/");
  }

  return (
    <nav className="site-nav" aria-label="Main navigation">
      <a className="brand" href="/">
        VastWorld
      </a>

      <div className="nav-links">
        {isAuthenticated() ? (
          <>
            <a href="/game">Enter the world</a>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
