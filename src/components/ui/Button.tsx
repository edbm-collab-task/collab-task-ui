/* On importe ButtonHTMLAttributes pour hériter des props natives d'un <button> */
import { ButtonHTMLAttributes } from "react";

/* Interface des props du composant Button */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /* Le contenu affiché à l'intérieur du bouton (texte ou élément) */
  children: React.ReactNode;
  /* Variante visuelle du bouton : primary (rempli) ou secondary (contour) */
  variant?: "primary" | "secondary";
  /* Indique si une action est en cours (affiche un état désactivé + texte adapté) */
  isLoading?: boolean;
}

/* Button est un bouton générique et réutilisable dans tout le projet */
function Button({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {

  /* Classes de base communes à toutes les variantes */
  const baseStyles =
    "w-full py-2.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed";

  /* Classes spécifiques selon la variante choisie */
  const variantStyles =
    variant === "primary"
      ? "bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white"
      : "border border-gray-300 hover:bg-gray-50 text-gray-700";

  return (
    <button
      /* Le bouton est désactivé si isLoading est vrai OU si disabled est passé explicitement */
      disabled={isLoading || disabled}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...rest}
    >
      {/* Si isLoading est vrai, on affiche un texte de chargement, sinon le contenu normal */}
      {isLoading ? "Chargement..." : children}
    </button>
  );
}

/* On exporte Button pour l'utiliser dans tous les formulaires et actions du projet */
export default Button;