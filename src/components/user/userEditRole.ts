import type { FormField } from "@/components/form/Forms";
import type { AttacheRole } from "@/types/role";
import { RoleType } from "@/enum/role.enum";

export const userAttachedRole: FormField<AttacheRole>[] = [
    {
        name: "role",
        label: "Rôle",
        type: "select",

        options: [
            {
                label: "Utilisateur",
                value: RoleType.USER
            },
            {
                label: "Administrateur",
                value: RoleType.ADMIN
            }
        ],

        validation: {
            required: "Le rôle est requis"
        }
    }
];