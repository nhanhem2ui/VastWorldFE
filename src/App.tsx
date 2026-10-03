import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/features/auth/pages/Login";
import Register from "@/features/auth/pages/Register";
import Game from "@/features/game/pages/Game";
import CreatePlayer from "@/features/playerCreation/pages/CreatePlayer";
import Map from "./features/worldMap/pages/Map";
import MapBuilder from "./features/mapBuilder/pages/MapBuilder";
import { AuthenticatedLayout } from "./AuthenticatedLayout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/createPlayer" element={<CreatePlayer />} />
      <Route path="/mapBuilder" element={<MapBuilder />} />

      {/* Pages that need to be logged in  */}
      <Route element={<AuthenticatedLayout />}>
        <Route path="/game" element={<Game />} />
        <Route path="/map" element={<Map />} />
      </Route>
    </Routes>
  );
}

export default App;
