import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useExistingPlayer } from "../hooks/checkPlayer";
import { setFlashMessage } from "../hooks/flashMessage";

function Game() {
  const { player, error } = useExistingPlayer();

  if (error) {
    setFlashMessage("Error joining the game");
    return <Navigate to={"/"} replace />;
  }
  console.log(player);
  if (player === null) {
    setFlashMessage("Player not exist,please create one");
    return <Navigate to={"/createPlayer"} replace />;
  }
  return (
    <>
      <section className="main">
        <Navbar />
        <div className="main-visual">
          <img className="background" src="" />
          <img className="character" />
        </div>
      </section>
    </>
  );
}
export default Game;
