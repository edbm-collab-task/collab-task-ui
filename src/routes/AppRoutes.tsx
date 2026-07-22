/* On importe le système de routes React */
import { Routes, Route } from "react-router-dom";

/* On importe notre page Login */
import LoginPage from "../pages/Auth/LoginPage";

/* Ce composant contient toutes les routes de l'application */
function AppRoutes() {
  return (
    /* Routes contient toutes les pages accessibles */
    <Routes>

      {/* Quand l'utilisateur visite /login */}
      {/* React affiche LoginPage */}
      <Route
        path="/login"
        element={<LoginPage />}
      />

    </Routes>
  );
}

/* On exporte le système de routes */
export default AppRoutes;