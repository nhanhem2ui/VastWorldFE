function Navbar() {
  return (
    <nav className="site-nav" aria-label="Main navigation">
      <a className="brand" href="#">
        VastWorld
      </a>
      <div className="nav-links">
        <a href="/login">Login</a>
        <a href="/register">Register</a>
      </div>
    </nav>
  );
}
export default Navbar;
