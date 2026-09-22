import { useEffect, useState } from "react";
import GlobalForms from "@/components/Form/GlobalForm";
import { userService } from "@/services/user/user.service";
import { roleService } from "@/services/role/role.service";
import { useLocation, useNavigate } from "react-router";

export default function EditUserRolePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);

    const email = location.state?.email;

    useEffect(() => {
        const loadRoles = async () => {
            try {
                const allRoles = await roleService.getAll();
                setRoles(allRoles.map(r => ({ label: r.name, value: r.codeRole })));
            } catch (error) {
                console.error("Erreur chargement rôles:", error);
            }
        };
        loadRoles();
    }, []);

    const handleEdit = async (data: { role: string }) => {
        try {
            await userService.updateRole({
                ...data,
                email
            });

            navigate("/admin/users");

        } catch (error) {
            console.error("Update role failed :", error);
        }
    };

    return (
        <div className="mx-auto max-w-100 mt-10">

            <GlobalForms<{ role: string }>
                title="Choisir un rôle"
                fields={[
                    {
                        name: "role",
                        label: "Rôle",
                        type: "select",
                        options: roles.length > 0
                            ? roles
                            : [
                                { label: "Utilisateur", value: "U1S" },
                                { label: "Administrateur", value: "A1D" },
                                { label: "Super Administrateur", value: "S1ADM" }
                            ],
                        validation: {
                            required: "Le rôle est requis"
                        }
                    }
                ]}
                onSubmit={handleEdit}
                submitLabel="Modifier"
            />

        </div>
    );
}