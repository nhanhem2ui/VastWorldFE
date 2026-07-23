import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/features/auth/pages/Login";
import Register from "@/features/auth/pages/Register";
import Game from "@/features/game/pages/Game";
import CreatePlayer from "@/features/playerCreation/pages/CreatePlayer";
import Map from "./features/worldMap/pages/Map";
import MapBuilder from "./features/mapBuilder/pages/MapBuilder";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/game" element={<Game />} />
      <Route path="/createPlayer" element={<CreatePlayer />} />
      <Route path="/map" element={<Map />} />
      <Route path="/mapBuilder" element={<MapBuilder />} />
    </Routes>
  );
}

export default App;
