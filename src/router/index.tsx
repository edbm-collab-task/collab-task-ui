import { Routes, Route } from "react-router-dom";
import NotFoundPage from "@/pages/NotFoundPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import LoginPage from "@/pages/auth/LoginPage";
import HommeAdminPage from "@/pages/admin/HommePage";
import ProtectedRoute from "@/router/ProtectedRoute";

export default function Router() {

    return (

        <Routes>

              {/* Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
             
              {/* Admin */}
              <Route path="/admin"
                element={
                    <ProtectedRoute>
                        <HommeAdminPage />
                    </ProtectedRoute>
                }/>

              {/* Error */}
              <Route path="*" element={<NotFoundPage />} />

        </Routes>

    );

}