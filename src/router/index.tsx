import { Routes, Route } from "react-router-dom";
import NotFoundPage from "@/pages/NotFoundPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import LoginPage from "@/pages/auth/LoginPage";
import ProtectedRoute from "@/router/ProtectedRoute";
import RecoveryPage from "@/pages/auth/recovery/RecoveryPage";
import VerificationPage from "@/pages/auth/verification/VerificationPage";
import SearchUserPage from "@/pages/user/SearchUserPage";
import RecoveryProtectedRoute from "@/router/RecoveryProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import CreateUserPage from "@/pages/admin/user/CreateUserPage";
import UserListPage from "@/pages/admin/user/UserListPage";
import Dashboard from "@/components/admin/Dashboard";
import CreateDirection from "@/pages/admin/direction/CreateDirectionPage"
import DirectionsListPage from "@/pages/admin/direction/DirectionListPage";
import ProjectListPage from "@/pages/admin/project/ProjectListPage";
import ProjectFormPage from "@/pages/admin/project/ProjectFormPage";
import ProjectDetailPage from "@/pages/admin/project/ProjectDetailPage";
import EditUserRolePage from "@/pages/admin/user/EditRolePage";

export default function Router() {

    return (

        <Routes>

            {/* Auth */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={< Dashboard />} />
                <Route path="users" element={<UserListPage />} />
                <Route path="users/create" element={<CreateUserPage />} />
                <Route path="users/edit-role" element={<EditUserRolePage />} />

                <Route path="directions" element={<DirectionsListPage />} />
                <Route path="directions/create" element={<CreateDirection />} />

                <Route path="projects" element={<ProjectListPage />} />
                <Route path="projects/create" element={<ProjectFormPage mode="create" />} />
                <Route path="projects/:id" element={<ProjectDetailPage />} />
                <Route path="projects/:id/edit" element={<ProjectFormPage mode="edit" />} />

            </Route>

            {/* Recovery */}
            <Route path="/information-personnelle" element={<RecoveryProtectedRoute><RecoveryPage /></RecoveryProtectedRoute>} />

            {/* Verification */}
            <Route path="/verification" element={<RecoveryProtectedRoute><VerificationPage /></RecoveryProtectedRoute>} />


            {/*Search User */}
            <Route path="/reccuperation-comptes" element={<SearchUserPage />} />


            {/* Error */}
            <Route path="*" element={<NotFoundPage />} />

        </Routes>

    );

}