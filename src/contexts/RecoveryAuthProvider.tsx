import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authService } from "@/services/auth/auth.service";
import { RecoveryAuthContext } from "./RecoveryAuthContext";

interface Props {
    children: ReactNode;
}

export default function RecoveryAuthProvider({ children }: Props) {

    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    async function refreshRecovery(): Promise<boolean> {

        try {

            await authService.recoveryMe();

            setAuthenticated(true);

            return true;

        } catch {

            setAuthenticated(false);

            return false;

        } finally {

            setLoading(false);

        }

    }

    // Le provider n'est monté que sur les routes de récupération (voir le
    // routeur) : sur /login ou dans l'admin, aucun appel /auth/recovery/me
    // n'est donc émis.
    useEffect(() => {

        refreshRecovery();

    }, []);

    return (

        <RecoveryAuthContext.Provider
            value={{
                authenticated,
                loading,
                refreshRecovery
            }}
        >

            {children}

        </RecoveryAuthContext.Provider>

    );

}