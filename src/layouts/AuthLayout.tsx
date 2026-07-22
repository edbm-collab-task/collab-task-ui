/* On importe le type ReactNode pour typer les enfants du composant */
import { ReactNode } from "react";

/* Interface décrivant les props attendues par AuthLayout */
interface AuthLayoutProps {
  /* Le contenu qui sera affiché dans la colonne de droite (le formulaire) */
  children: ReactNode;
}

/* AuthLayout est le layout partagé par toutes les pages d'authentification */
/* Il affiche un panneau de branding à gauche et le formulaire à droite */
function AuthLayout({ children }: AuthLayoutProps) {
  return (
    /* Conteneur principal : prend toute la hauteur de l'écran, disposition en flex */
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6 gap-6">

      {/* Colonne gauche : panneau de branding avec dégradé violet */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 max-w-xl rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-12">

        {/* Logo de l'application */}
        <div className="flex justify-center mb-6">
          <img src="/src/assets/icon.png" alt="CollaB Tasks" className="w-40" />
        </div>

        {/* Titre accrocheur */}
        <h1 className="text-3xl font-bold text-center mb-4">
          La solution ultime pour la gestion de projets moderne
        </h1>

        {/* Description de la plateforme */}
        <p className="text-center text-white/90 mb-6">
          CollaB Tasks est une plateforme intuitive et performante, pensée
          pour simplifier la gestion des tâches et renforcer la
          collaboration au sein de votre équipe.
        </p>

        {/* Liste des bénéfices */}
        <ul className="space-y-2 text-white/90 list-disc list-inside mb-6">
          <li>Planifiez, suivez et priorisez vos tâches en temps réel.</li>
          <li>Collaborez facilement avec vos collègues.</li>
          <li>Visualisez vos projets clairement.</li>
          <li>Accédez à vos tâches depuis n'importe quel appareil.</li>
        </ul>

        {/* Phrase d'accroche finale */}
        <p className="text-center italic text-white/80">
          CollaB Tasks transforme la gestion de vos projets en une expérience
          fluide, organisée et collaborative.
        </p>
      </div>

      {/* Colonne droite : zone où s'affiche le formulaire (login, register...) */}
      <div className="w-full lg:w-1/2 max-w-md bg-white rounded-2xl shadow-md p-8">
        {children}
      </div>

    </div>
  );
}

/* On exporte le layout pour l'utiliser dans les pages d'authentification */
export default AuthLayout;