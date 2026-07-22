/* On importe le système de routes */
import AppRoutes from "./routes/AppRoutes";

/* Composant principal de l'application */
function App() {
  return (
    /* Affiche la page correspondant à l'URL */
    <AppRoutes />
  );
}

/* Export du composant principal */
export default App;