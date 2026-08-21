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
import UserProfile from "@/pages/admin/user/UserProfile";
import EditUserPage from "@/pages/admin/user/EditUserPage";
import ChangePwdPage from "@/pages/auth/recovery/SetPwd";
import MessagePage from "@/pages/admin/message/MessagePage";
import NotificationsPage from "@/pages/admin/notification/NotificationsPage";
import ActivityHistoryPage from "@/pages/admin/project/ActivityHistoryPage";
import AdminListPage from "@/pages/admin/superadmin/AdminListPage";
import RoleListPage from "@/pages/admin/superadmin/RoleListPage";
import SuperAdminRoute from "@/router/SuperAdminRoute";
import PermissionRoute from "@/router/PermissionRoute";

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
                <Route index element={<Dashboard />} />

                <Route path="users" element={
                    <PermissionRoute permission="VIEW_USERS"><UserListPage /></PermissionRoute>
                } />
                <Route path="users/create" element={
                    <PermissionRoute permission="MANAGE_USERS"><CreateUserPage /></PermissionRoute>
                } />
                <Route path="users/edit-role" element={
                    <PermissionRoute permission="MANAGE_USERS"><EditUserRolePage /></PermissionRoute>
                } />
                <Route path="users/profile" element={<UserProfile />} />
                <Route path="users/:id/edit" element={
                    <PermissionRoute permission="MANAGE_USERS"><EditUserPage /></PermissionRoute>
                } />
                <Route path="users/change-pwd" element={<ChangePwdPage />} />

                <Route path="directions" element={
                    <PermissionRoute permission="MANAGE_DIRECTIONS"><DirectionsListPage /></PermissionRoute>
                } />
                <Route path="directions/create" element={
                    <PermissionRoute permission="MANAGE_DIRECTIONS"><CreateDirection /></PermissionRoute>
                } />

                <Route path="projects" element={
                    <PermissionRoute permission="MANAGE_PROJECTS"><ProjectListPage /></PermissionRoute>
                } />
                <Route path="projects/create" element={
                    <PermissionRoute permission="MANAGE_PROJECTS"><ProjectFormPage mode="create" /></PermissionRoute>
                } />
                <Route path="projects/:id" element={
                    <PermissionRoute permission="MANAGE_PROJECTS"><ProjectDetailPage /></PermissionRoute>
                } />
                <Route path="projects/:id/edit" element={
                    <PermissionRoute permission="MANAGE_PROJECTS"><ProjectFormPage mode="edit" /></PermissionRoute>
                } />
                <Route path="projects/:id/history" element={
                    <PermissionRoute permission="MANAGE_PROJECTS"><ActivityHistoryPage /></PermissionRoute>
                } />

                <Route path="messages" element={<MessagePage />} />

                <Route path="notifications" element={<NotificationsPage />} />

                <Route path="admins" element={<SuperAdminRoute><AdminListPage /></SuperAdminRoute>} />
                <Route path="roles" element={<SuperAdminRoute><RoleListPage /></SuperAdminRoute>} />

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
