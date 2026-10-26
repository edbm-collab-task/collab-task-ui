import GlobalForms from "@/components/Form/GlobalForm";
import type { CreateUser } from "@/types/user";
import { authService } from "@/services/auth/auth.service";
import { useNavigate } from "react-router";
import type { DirectionRes } from "@/types/direction";
import { useState, useEffect } from "react";
import { directionService } from "@/services/direction/direction.service";
import { roleService } from "@/services/role/role.service";
import { createUserFormFields } from "@/components/user/createUserForm"
import usePermissions from "@/hooks/usePermissions";
import { PERM } from "@/constants/permissions";
import { ACT } from "@/constants/actions";
import { parseDirectionIdInput } from "@/utils/direction";

export default function CreateUserPage() {

    const navigate = useNavigate();
    const { hasPermission } = usePermissions();
    const canManageAdmins = hasPermission(PERM.MANAGE_ADMINS, ACT.SELECT);
    const [directions, setDirections] = useState<DirectionRes[]>([]);
    const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);

    const handleRegister = async (data: CreateUser) => {

        try {
            const directionId = parseDirectionIdInput(data.directionId);
            const payload: CreateUser = { ...data };

            if (directionId === undefined || directionId === null) {
                delete payload.directionId;
            } else {
                payload.directionId = directionId;
            }

            await authService.create(payload);

            navigate(canManageAdmins ? "/admin/admins" : "/admin/users");

        } catch (error) {

            console.error("Register failed :", error);

        }
    };

    useEffect(() => {
        const loadDirections = async () => {
            try {
                const response = await directionService.getAll();
                setDirections(response);
            } catch (error) {
                console.error(error);
            }
        };

        loadDirections();
    }, []);

    useEffect(() => {
        const loadRoles = async () => {
            try {
                const allRoles = await roleService.getAll();
                const filtered = canManageAdmins
                    ? allRoles
                    : allRoles.filter(r => r.name === "USER");
                setRoles(filtered.map(r => ({ label: r.name, value: r.codeRole })));
            } catch (error) {
                console.error(error);
            }
        };
        loadRoles();
    }, [canManageAdmins]);

    return (
        <div className="mx-auto  mt-10">

            <GlobalForms<CreateUser>
                title="Créer un utilisateur"
                subtitle="Veuiller definir"
                fields={createUserFormFields(directions, roles)}
                onSubmit={handleRegister}
                submitLabel="Créer"
            />

        </div>
    );
}