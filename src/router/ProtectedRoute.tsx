import { Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import AdminLayoutSkeleton from "@/components/admin/skeleton/AdminLayoutSkeleton";


interface Props {
    children: React.ReactNode;
}


function LoadingScreen() {

    return (
        <AdminLayoutSkeleton />
    );

}



export default function ProtectedRoute({ children }: Props) {

    const { user, loading } = useAuth();


    if (loading) {

        return <LoadingScreen />;

    }


    if (!user) {

        return <Navigate to="/login" replace />;

    }


    return children;

}