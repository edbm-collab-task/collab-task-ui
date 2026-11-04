import { useEffect, useState } from "react";
import GlobalForms from "@/components/Form/GlobalForm";
import Spinner from "@/components/common/Spinner";
import { userService } from "@/services/user/user.service";
import { roleService } from "@/services/role/role.service";
import { getRoleLabel } from "@/constants/roleLabels";
import { useLocation, useNavigate } from "react-router";
import type { UserResponse } from "@/types/user";

export default function EditUserRolePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);
    const [user, setUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            setLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                const [allRoles, currentUser] = await Promise.all([
                    roleService.getAll(),
                    userService.getByEmail({ email })
                ]);

                setRoles(allRoles.map(r => ({
                    label: getRoleLabel(r.codeRole, r.name),
                    value: r.codeRole
                })));
                setUser(currentUser);
            } catch (error) {
                console.error("Erreur chargement du rôle:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [email]);

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

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Spinner size={28} className="text-primary" />
            </div>
        );
    }

    if (!email) {
        return (
            <div className="mx-auto max-w-100 mt-10 text-center text-gray-500">
                Impossible de modifier le rôle : email utilisateur introuvable.
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-100 mt-10">

            <GlobalForms<{ role: string }>
                title="Choisir un rôle"
                subtitle={
                    user
                        ? `Rôle actuel : ${getRoleLabel(user.codeRole, user.role)}`
                        : undefined
                }
                defaultValues={{ role: user?.codeRole ?? "" }}
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
