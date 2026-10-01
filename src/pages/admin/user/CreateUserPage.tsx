import GlobalForms from "@/components/Form/GlobalForm";
import type { CreateUser } from "@/types/user";
import { authService } from "@/services/auth/auth.service";
import { useNavigate } from "react-router";
import type { DirectionRes } from "@/types/direction";
import { useState, useEffect } from "react";
import { directionService } from "@/services/direction/direction.service";
import { roleService } from "@/services/role/role.service";
import { createUserFormFields } from "@/components/user/createUserForm"
import useAuth from "@/hooks/useAuth";

export default function CreateUserPage() {

    const navigate = useNavigate();
    const { user } = useAuth();
    const isSuperAdmin = user?.role === "SUPER_ADMIN";
    const [directions, setDirections] = useState<DirectionRes[]>([]);
    const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);

    const handleRegister = async (data: CreateUser) => {

        try {
            await authService.create(data);

            navigate(isSuperAdmin ? "/admin/admins" : "/admin/users");

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
                const filtered = isSuperAdmin
                    ? allRoles
                    : allRoles.filter(r => r.name === "USER");
                setRoles(filtered.map(r => ({ label: r.name, value: r.codeRole })));
            } catch (error) {
                console.error(error);
            }
        };
        loadRoles();
    }, [isSuperAdmin]);

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