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
import AdminDashboard from "@/components/admin/AdminDashboard";
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
import { PERM } from "@/constants/permissions";
import { ACTN } from "@/constants/actions";
import PermissionRoute from "@/router/PermissionRoute";
import SelfRoute from "@/router/SelfRoute";

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
                    <PermissionRoute permission={PERM.MANAGE_USERS} action={ACTN.SELECT}><UserListPage /></PermissionRoute>
                } />
                <Route path="users/create" element={
                    <PermissionRoute permission={PERM.MANAGE_USERS} action={ACTN.INSERT}><CreateUserPage /></PermissionRoute>
                } />
                <Route path="users/edit-role" element={
                    <PermissionRoute permission={PERM.MANAGE_USERS} action={ACTN.UPDATE}><EditUserRolePage /></PermissionRoute>
                } />
                <Route path="users/profile" element={<UserProfile />} />
                <Route path="users/:id/edit" element={
                    <SelfRoute><EditUserPage /></SelfRoute>
                } />
                <Route path="users/change-pwd" element={<ChangePwdPage />} />

                <Route path="directions" element={
                    <PermissionRoute permission={PERM.MANAGE_DIRECTIONS} action={ACTN.SELECT}><DirectionsListPage /></PermissionRoute>
                } />
                <Route path="directions/create" element={
                    <PermissionRoute permission={PERM.MANAGE_DIRECTIONS} action={ACTN.INSERT}><CreateDirection /></PermissionRoute>
                } />

                <Route path="projects" element={
                    <PermissionRoute permission={PERM.MANAGE_PROJECTS} action={ACTN.SELECT}><ProjectListPage /></PermissionRoute>
                } />
                <Route path="projects/create" element={
                    <PermissionRoute permission={PERM.MANAGE_PROJECTS} action={ACTN.INSERT}><ProjectFormPage mode="create" /></PermissionRoute>
                } />
                <Route path="projects/:id" element={
                    <PermissionRoute permission={PERM.MANAGE_PROJECTS} action={ACTN.SELECT}><ProjectDetailPage /></PermissionRoute>
                } />
                <Route path="projects/:id/edit" element={
                    <PermissionRoute permission={PERM.MANAGE_PROJECTS} action={ACTN.UPDATE}><ProjectFormPage mode="edit" /></PermissionRoute>
                } />
                <Route path="projects/:id/history" element={
                    <PermissionRoute permission={PERM.MANAGE_PROJECTS} action={ACTN.SELECT}><ActivityHistoryPage /></PermissionRoute>
                } />

                <Route path="messages" element={<MessagePage />} />

                <Route path="notifications" element={<NotificationsPage />} />

                <Route path="dashboard-admin" element={<PermissionRoute permission={PERM.MANAGE_GLOBAL_REPORTS} action={ACTN.SELECT}><AdminDashboard /></PermissionRoute>} />
                <Route path="admins" element={<PermissionRoute permission={PERM.MANAGE_ADMINS} action={ACTN.SELECT}><AdminListPage /></PermissionRoute>} />
                <Route path="roles" element={<PermissionRoute permission={PERM.MANAGE_ROLES} action={ACTN.SELECT}><RoleListPage /></PermissionRoute>} />

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
