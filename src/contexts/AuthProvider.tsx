import {createContext,useEffect,useRef,useState} from "react";
import type {ReactNode} from "react";
import toast from "react-hot-toast";
import type {UserLoginReq,UserLoginRes} from "@/types/user";
import {authService} from "@/services/auth/auth.service";
import {onSessionResync,requestSessionResync} from "@/services/auth/sessionSync";


interface AuthContextType {

    user: UserLoginRes | null;

    loading: boolean;

    login(data: UserLoginReq): Promise<UserLoginRes>;

    logout(): Promise<void>;

    refreshUser(): Promise<UserLoginRes | null>;

}


export const AuthContext = createContext<AuthContextType | undefined>(undefined);


interface Props {
    children: ReactNode;
}


/**
 * Compare deux sessions pour détecter un changement de droits.
 * Compare le rôle et la liste des permissions (noms + masques d'actions).
 */
function sessionChanged(a: UserLoginRes, b: UserLoginRes): boolean {

    if (a.role !== b.role || a.codeRole !== b.codeRole) return true;

    return JSON.stringify(a.permissions) !== JSON.stringify(b.permissions);

}


export default function AuthProvider({children}: Props) {


    const [user,setUser] = useState<UserLoginRes | null>(null);

    const [loading,setLoading] = useState(true);

    const userRef = useRef<UserLoginRes | null>(null);


    useEffect(()=>{

        userRef.current = user;

    },[user]);


    /**
     * Recharge la session depuis GET /auth/me.
     *
     * - Mode normal (montage) : un échec déconnecte l'utilisateur.
     * - Mode `resync` (navigation / focus / 403) : un échec réseau conserve la
     *   session courante pour ne pas déconnecter à la moindre coupure.
     */
    async function refreshUser(options?: {resync?: boolean}): Promise<UserLoginRes | null>{

        try {

            const response = await authService.me();

            setUser(response);

            return response;

        }
        catch{

            if (!options?.resync) setUser(null);

            return null;

        }
        finally{

            setLoading(false);

        }

    }


    async function login(data: UserLoginReq): Promise<UserLoginRes>{

        const response = await authService.login(data);
       
        setUser(response);

        return response;

    }


    async function logout(): Promise<void>{

        try {

            await authService.logout();

        }
        finally {

            setUser(null);

        }

    }


    useEffect(()=>{

        refreshUser();

    },[]);


    /**
     * Resynchronisation demandée par le bus `sessionSync` (intercepteur axios,
     * ProtectedRoute, focus de fenêtre).
     */
    useEffect(()=>{

        return onSessionResync(async ({reason,user:refreshed})=>{

            if (reason === "token-refresh" && refreshed?.permissions) {

                setUser(refreshed);

                return;

            }

            if (reason === "403") {

                const before = userRef.current;

                const after = await refreshUser({resync:true});

                if (before && after && sessionChanged(before,after)) {

                    toast.success("Vos droits ont été mis à jour.");

                }

                return;

            }

            await refreshUser({resync:true});

        });

    },[]);


    /**
     * Resync au retour de l'onglet (throttlé 30 s par sessionSync).
     */
    useEffect(()=>{

        const handleVisible = ()=>{

            if (document.visibilityState !== "visible") return;

            if (!userRef.current) return;

            requestSessionResync("focus");

        };

        document.addEventListener("visibilitychange",handleVisible);

        window.addEventListener("focus",handleVisible);

        return ()=>{

            document.removeEventListener("visibilitychange",handleVisible);

            window.removeEventListener("focus",handleVisible);

        };

    },[]);


    /**
     * Logout effectué dans un autre onglet (évent `storage`) → déconnexion ici.
     */
    useEffect(()=>{

        const handleStorage = (event: StorageEvent)=>{

            if (event.key !== "accessToken") return;

            if (event.newValue === null) setUser(null);

        };

        window.addEventListener("storage",handleStorage);

        return ()=>window.removeEventListener("storage",handleStorage);

    },[]);


    return (

        <AuthContext.Provider value={{user,loading,login,logout,refreshUser}}>

            {children}

        </AuthContext.Provider>

    );

}
