import { createContext } from "react";
import type { UserLoginReq, UserLoginRes } from "@/types/user";

/**
 * Contexte d'authentification.
 *
 * Isolé dans son propre fichier (plutôt que dans AuthProvider.tsx) afin que
 * le module n'exporte qu'un composant : le Fast Refresh de Vite ne recharge
 * alors que le provider et préserve l'état du contexte.
 */
export interface AuthContextType {

    user: UserLoginRes | null;

    loading: boolean;

    login(data: UserLoginReq): Promise<UserLoginRes>;

    logout(): Promise<void>;

    refreshUser(): Promise<UserLoginRes | null>;

}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
