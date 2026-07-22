/* On importe le layout partagé des pages d'authentification */
import AuthLayout from "../../layouts/AuthLayout";

/* On importe le composant LoginForm */
/* Ce composant contient le formulaire de connexion */
import LoginForm from "../../components/forms/LoginForm";

/* LoginPage contient une page complète de l'application */
/* Son rôle est d'organiser l'affichage de la page login */
function LoginPage() {
  return (
    /* AuthLayout gère la mise en page globale (panneau + formulaire) */
    <AuthLayout>
      {/* On affiche le formulaire de connexion */}
      <LoginForm />
    </AuthLayout>
  );
}

/* On exporte la page pour pouvoir l'utiliser dans les routes */
export default LoginPage;