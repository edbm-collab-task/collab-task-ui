import { Routes, Route } from "react-router-dom";
import NotFoundPage from "@/pages/NotFoundPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import LoginPage from "@/pages/auth/LoginPage";
import HommeAdminPage from "@/pages/admin/HommePage";
import ProtectedRoute from "@/router/ProtectedRoute";
import RecoveryPage from "@/pages/recovery/RecoveryPage";
import VerificationPage from "@/pages/verification/VerificationPage";
import SearchUserPage from "@/pages/user/SearchUserPage";
import RecoveryProtectedRoute from "@/router/RecoveryProtectedRoute";

export default function Router() {

    return (

        <Routes>

              {/* Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
             
              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute> <HommeAdminPage /> </ProtectedRoute>}/>

              {/* Recovery */}
              <Route path="/information-personnelle" element={<RecoveryPage />} />

              {/* Verification */}
              <Route path="/verification" element={<VerificationPage />} />


              {/*Search User */}
              <Route path="/reccuperation-comptes" element={<SearchUserPage />} />


              {/* Error */}
              <Route path="*" element={<NotFoundPage />} />

        </Routes>

    );

}