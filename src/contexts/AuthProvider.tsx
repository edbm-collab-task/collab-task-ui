import {useEffect,useRef,useState} from "react";
import type {ReactNode} from "react";
import toast from "react-hot-toast";
import type {UserLoginReq,UserLoginRes} from "@/types/user";
import {authService} from "@/services/auth/auth.service";
import {onSessionResync,requestSessionResync} from "@/services/auth/sessionSync";
import {roleService} from "@/services/role/role.service";
import {hydrateActionCatalog} from "@/constants/actions";
import {AuthContext} from "./AuthContext";


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

    /**
     * Version de session : incrémentée à chaque login/logout.
     * Permet d'ignorer une réponse de `refreshUser()` lancée avant le login
     * (hydratation initiale) qui écraserait sinon la session fraîchement créée.
     */
    const sessionVersionRef = useRef(0);


    useEffect(()=>{

        userRef.current = user;

    },[user]);


    /**
     * Recharge la session depuis GET /auth/me.
     *
     * - Mode normal (montage) : un échec déconnecte l'utilisateur.
     * - Mode `resync` (navigation / focus / sidebar / 403) : un échec réseau conserve la
     *   session courante pour ne pas déconnecter à la moindre coupure.
     */
    async function refreshUser(options?: {resync?: boolean}): Promise<UserLoginRes | null>{

        const versionAtStart = sessionVersionRef.current;

        try {

            const response = await authService.me();

            // Un login/logout a eu lieu pendant la requête : la réponse est
            // obsolète et ne doit pas écraser la session courante.
            if (versionAtStart !== sessionVersionRef.current) {
                return userRef.current;
            }

            setUser(response);

            return response;

        }
        catch{

            if (versionAtStart !== sessionVersionRef.current) {
                return userRef.current;
            }

            if (!options?.resync) setUser(null);

            return null;

        }
        finally{

            if (versionAtStart === sessionVersionRef.current) {
                setLoading(false);
            }

        }

    }


    async function login(data: UserLoginReq): Promise<UserLoginRes>{

        const response = await authService.login(data);

        // Invalide les éventuelles hydratations encore en cours.
        sessionVersionRef.current += 1;

        setUser(response);

        // La session est établie : ProtectedRoute n'a plus de raison d'attendre
        // la fin de l'hydratation initiale pour afficher la page de destination.
        setLoading(false);

        return response;

    }


    async function logout(): Promise<void>{

        try {

            await authService.logout();

        }
        finally {

            sessionVersionRef.current += 1;

            setUser(null);
            setLoading(false);

        }

    }


    /**
     * Montage : hydrate le catalogue des actions (`ACT`, codes binaires) depuis
     * `GET /roles/actions` **puis** charge la session. `loading` ne passe à
     * `false` qu'une fois les deux terminés : les pages ne rendent jamais avec
     * un catalogue vide (codes à 0 → éléments permissionnés masqués).
     *
     * Un échec du catalogue est silencieux (appel `silent`) : les codes restent
     * à 0, fail-closed.
     */
    useEffect(()=>{

        (async ()=>{

            try {

                const catalog = await roleService.getActions();

                hydrateActionCatalog(catalog);

            }
            catch{

                /* catalogue laissé à 0 : fail-closed */

            }

            await refreshUser();

        })();

    },[]);


    /**
     * Resynchronisation demandée par le bus `sessionSync` (intercepteur axios,
     * ProtectedRoute, focus de fenêtre, ouverture/survol de la barre
     * latérale).
     *
     * La session est rechargée puis comparée à la précédente : si les droits
     * ont réellement changé, l'utilisateur en est informé par un toast — quel
     * que soit le déclencheur (403, navigation, focus, sidebar).
     */
    useEffect(()=>{

        return onSessionResync(async ({reason,user:refreshed})=>{

            if (reason === "token-refresh" && refreshed?.permissions) {

                setUser(refreshed);

                return;

            }

            const before = userRef.current;

            const after = await refreshUser({resync:true});

            if (before && after && sessionChanged(before,after)) {

                toast.success("Vos droits ont été mis à jour.");

            }

        });

    },[]);


    /**
     * Resync au retour de l'onglet (throttlé 1 min par sessionSync).
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
