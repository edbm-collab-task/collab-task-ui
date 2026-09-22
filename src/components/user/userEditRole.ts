import type { FormField } from "@/components/form/Forms";
import type { AttacheRole } from "@/types/role";

export const userAttachedRole = (roles: { label: string; value: string }[] = []): FormField<AttacheRole>[] => [
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
];