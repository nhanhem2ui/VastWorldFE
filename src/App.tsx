import "./App.css";
import CurrentStatus from "./components/CurrentStatus";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";

const highlights = [
  {
    title: "Open world",
    text: "Explore regions, discover resources, and build your route through a growing fantasy landscape.",
  },
  {
    title: "Player driven",
    text: "Craft gear, trade materials, and shape your progression around the way you like to play.",
  },
  {
    title: "Always expanding",
    text: "New quests, areas, and systems can slot into a clean foundation as the project grows.",
  },
];

function App() {
  const isLoginPage =
    window.location.pathname === "/login" ||
    window.location.pathname === "/pages/login";
  const isRegisterPage =
    window.location.pathname === "/register" ||
    window.location.pathname === "/pages/register";

  if (isLoginPage) {
    return <Login />;
  }

  if (isRegisterPage) {
    return <Register />;
  }

  return (
    <main className="homepage">
      <Navbar />

      <section className="hero" id="play">
        <div className="hero-content">
          <p className="eyebrow">Fantasy adventure platform</p>
          <h1>VastWorld</h1>
          <p className="hero-copy">
            A simple starting point for an immersive game homepage with room for
            news, gameplay, and community updates.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#game">
              See the world
            </a>
          </div>
        </div>
      </section>

      <section
        className="features"
        id="features"
        aria-labelledby="features-title"
      >
        <div className="section-heading">
          <p className="eyebrow">Core experience</p>
          <h2 id="features-title">Built for a bigger journey</h2>
        </div>
        <div className="feature-grid">
          {highlights.map((item) => (
            <article className="feature-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <CurrentStatus />
    </main>
  );
}

export default App;
