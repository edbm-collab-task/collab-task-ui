import { createContext } from "react";

/**
 * Contexte d'authentification « récupération de mot de passe ».
 *
 * Isolé dans son propre fichier (plutôt que dans RecoveryAuthProvider.tsx)
 * afin que le module n'exporte qu'un composant : le Fast Refresh de Vite ne
 * recharge alors que le provider et préserve l'état du contexte.
 */
export interface RecoveryAuthContextType {

    authenticated: boolean;

    loading: boolean;

    refreshRecovery(): Promise<boolean>;

}

export const RecoveryAuthContext =
    createContext<RecoveryAuthContextType | undefined>(undefined);
