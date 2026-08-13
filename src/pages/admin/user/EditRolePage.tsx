import GlobalForms from "@/components/form/GlobalForm";
import { userService } from "@/services/user/user.service";
import { useLocation,useNavigate } from "react-router";
import type { AttacheRole } from "@/types/role";
import { userAttachedRole } from "@/components/user/userEditRole";

export default function EditUserRolePage() {
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;

    const handleEdit = async (data: AttacheRole) => {
        try {
            const userToUpdateRole = await userService.updateRole({
                ...data,
                email
            });

            console.log("Role attached with :", userToUpdateRole);

            navigate("/admin/users");

        } catch (error) {
            console.error("Update role failed :", error);
        }
    };

    return (
        <div className="mx-auto max-w-100 mt-10">

            <GlobalForms<AttacheRole>
                title="Choisir un rôle"
                fields={userAttachedRole}
                onSubmit={handleEdit}
                submitLabel="Modifier"
            />

        </div>
    );
}