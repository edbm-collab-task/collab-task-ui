import {createContext,useEffect,useState} from "react";
import type {ReactNode} from "react";
import type {UserLoginReq,UserLoginRes} from "@/types/user";
import {authService} from "@/services/auth/auth.service";


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


export default function AuthProvider({children}: Props) {


    const [user,setUser] = useState<UserLoginRes | null>(null);

    const [loading,setLoading] = useState(true);


    async function refreshUser(): Promise<UserLoginRes | null>{

        try {

            const response = await authService.me();

            setUser(response);

            return response;

        }
        catch(error){

            setUser(null);

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


    return (

        <AuthContext.Provider value={{user,loading,login,logout,refreshUser}}>

            {children}

        </AuthContext.Provider>

    );

}