import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authService } from "@/services/auth/auth.service";

interface RecoveryAuthContextType {

    authenticated: boolean;

    loading: boolean;

    refreshRecovery(): Promise<boolean>;

}

export const RecoveryAuthContext =
    createContext<RecoveryAuthContextType | undefined>(undefined);

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