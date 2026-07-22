/* On importe useState pour gérer l'état local du formulaire */
import { useState } from "react";

/* On importe les composants réutilisables depuis components/ui */
import Input from "../ui/Input";
import PasswordInput from "../ui/PasswordInput";
import Button from "../ui/Button";
import SocialButton from "../ui/SocialButton";

/* On importe les icônes Google et GitHub */
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

/* Ce composant représente le formulaire de connexion */
function LoginForm() {

  /* État pour stocker la valeur de l'email saisi */
  const [email, setEmail] = useState("");

  /* État pour stocker la valeur du mot de passe saisi */
  const [password, setPassword] = useState("");

  /* État pour désactiver le bouton pendant l'envoi du formulaire */
  const [isLoading, setIsLoading] = useState(false);

  /* Fonction appelée quand l'utilisateur soumet le formulaire */
  const handleSubmit = (e: React.FormEvent) => {
    /* Empêche le rechargement de la page par défaut */
    e.preventDefault();

    /* On active l'état de chargement */
    setIsLoading(true);

    /* TODO : appeler auth.service.ts pour envoyer email + password au backend */
    console.log("Connexion avec :", { email, password });

    /* On désactive le chargement (à adapter une fois l'appel API branché) */
    setIsLoading(false);
  };

  /* La fonction retourne l'interface HTML de notre formulaire */
  return (

    /* Balise form : représente un formulaire HTML */
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* Titre du formulaire */}
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenue sur <span className="text-indigo-600">CollaB Tasks</span>
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Connectez-vous pour organiser vos projets simplement et efficacement.
        </p>
      </div>

      {/* Champ email, réutilise le composant générique Input */}
      <Input
        id="email"
        label="Adresse email"
        type="email"
        placeholder="Votre adresse email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {/* Champ mot de passe, réutilise le composant générique PasswordInput */}
      <PasswordInput
        id="password"
        label="Mot de passe"
        placeholder="Votre mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {/* Lien mot de passe oublié */}
      <div className="text-right">
        <a href="/forgot-password" className="text-sm text-indigo-600 hover:underline">
          Mot de passe oublié ?
        </a>
      </div>

      {/* Bouton d'envoi, réutilise le composant générique Button */}
      <Button type="submit" isLoading={isLoading}>
        Se connecter
      </Button>

      {/* Séparateur */}
      <div className="flex items-center gap-3 text-gray-400 text-sm">
        <div className="flex-1 h-px bg-gray-200" />
        ou se connecter avec
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Boutons de connexion via OAuth, réutilisent le composant générique SocialButton */}
      <div className="flex flex-col gap-3">
        <SocialButton
          icon={<FcGoogle size={20} />}
          label="Google"
          onClick={() => console.log("Connexion Google")}
        />
        <SocialButton
          icon={<FaGithub size={20} />}
          label="GitHub"
          onClick={() => console.log("Connexion GitHub")}
        />
      </div>

    </form>

  );
}

/* On exporte le composant */
/* Cela permet de l'importer dans LoginPage */
export default LoginForm;