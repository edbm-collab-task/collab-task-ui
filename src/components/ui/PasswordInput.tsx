/* On importe useState pour gérer l'affichage/masquage du mot de passe */
import { useState } from "react";

/* On importe InputHTMLAttributes pour hériter des props natives d'un <input> */
import { InputHTMLAttributes } from "react";

/* On importe les icônes œil ouvert / œil barré */
import { FiEye, FiEyeOff } from "react-icons/fi";

/* Interface des props du composant PasswordInput */
/* On exclut "type" car il est géré en interne (toggle text/password) */
interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /* Le libellé affiché au-dessus du champ */
  label: string;
  /* Identifiant unique du champ */
  id: string;
}

/* PasswordInput est un champ mot de passe réutilisable */
/* Il inclut un bouton pour afficher/masquer la saisie */
function PasswordInput({ label, id, ...rest }: PasswordInputProps) {

  /* État local : détermine si le mot de passe est visible ou masqué */
  const [showPassword, setShowPassword] = useState(false);

  return (
    /* Conteneur du champ : label + input empilés verticalement */
    <div className="flex flex-col gap-1">

      {/* Label du champ, relié à l'input via htmlFor/id */}
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Conteneur relatif pour positionner l'icône œil à l'intérieur du champ */}
      <div className="relative">
        <input
          id={id}
          /* Le type change dynamiquement selon showPassword */
          type={showPassword ? "text" : "password"}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          {...rest}
        />

        {/* Bouton pour afficher/masquer le mot de passe */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {/* Icône œil barré si visible, œil ouvert si masqué */}
          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>
    </div>
  );
}

/* On exporte PasswordInput pour l'utiliser dans Login, Register, ChangePassword, etc. */
export default PasswordInput;