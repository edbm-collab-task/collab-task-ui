/* On importe InputHTMLAttributes pour hériter de toutes les props natives d'un <input> */
import { InputHTMLAttributes } from "react";

/* Interface des props du composant Input */
/* On étend les attributs natifs HTML (type, placeholder, value, onChange, required...) */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /* Le libellé affiché au-dessus du champ */
  label: string;
  /* Identifiant unique du champ, utilisé pour lier le label et l'input */
  id: string;
}

/* Input est un champ de formulaire générique et réutilisable */
/* Utilisé pour email, texte, nombre, etc. dans tout le projet */
function Input({ label, id, ...rest }: InputProps) {
  return (
    /* Conteneur du champ : label + input empilés verticalement */
    <div className="flex flex-col gap-1">

      {/* Label du champ, relié à l'input via htmlFor/id */}
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Champ de saisie */}
      {/* Le spread {...rest} permet de passer type, value, onChange, placeholder, required, etc. */}
      <input
        id={id}
        className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        {...rest}
      />
    </div>
  );
}

/* On exporte Input pour l'utiliser dans tous les formulaires du projet */
export default Input;