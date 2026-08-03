import {Navigate} from "react-router-dom";
import useAuth from "@/hooks/useAuth";


interface Props {
    children: React.ReactNode;
}


function LoadingScreen(){

    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-50">

            <div className="flex flex-col items-center gap-4">

                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>

                <p className="text-gray-600 text-sm">
                    Vérification de votre session...
                </p>

            </div>

        </div>

    );

}



export default function ProtectedRoute({children}: Props){

    const {user,loading} = useAuth();


    if(loading){

        return <LoadingScreen />;

    }


    if(!user){

        return <Navigate to="/login" replace />;

    }


    return children;

}