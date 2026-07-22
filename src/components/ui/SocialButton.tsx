/* On importe ReactNode pour typer l'icône passée en prop */
import { ReactNode } from "react";

/* Interface des props du composant SocialButton */
interface SocialButtonProps {
  /* L'icône affichée à gauche du texte (ex: logo Google, logo GitHub) */
  icon: ReactNode;
  /* Le texte affiché sur le bouton (ex: "Google", "GitHub") */
  label: string;
  /* Fonction appelée au clic sur le bouton */
  onClick?: () => void;
}

/* SocialButton est un bouton de connexion OAuth générique et réutilisable */
/* Utilisé pour Google, GitHub, et tout autre fournisseur ajouté plus tard */
function SocialButton({ icon, label, onClick }: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-gray-300 rounded-lg py-2 flex items-center justify-center gap-2 text-sm hover:bg-gray-50 w-full"
    >
      {/* Icône du fournisseur (Google, GitHub...) */}
      {icon}
      {/* Nom du fournisseur */}
      {label}
    </button>
  );
}

/* On exporte SocialButton pour l'utiliser partout où une connexion sociale est nécessaire */
export default SocialButton;