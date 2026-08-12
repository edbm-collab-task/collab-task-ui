import type { DetailField } from "@/components/details/globalDetail";
import type { UserDetails} from "@/types/user";

import {
    User,
    Mail,
    VenusAndMars,
    Phone,
    Building2,
    BriefcaseBusiness,
    CircleCheck,
    CalendarDays,
    Shield,
} from "lucide-react";

export const userDetailFields: DetailField<UserDetails>[] = [
    {
        key: "firstname",
        label: "Prénom",
        icon: <User className="h-4 w-4" />,
    },
    {
        key: "lastname",
        label: "Nom",
        icon: <User className="h-4 w-4" />,
    },
    {
        key: "email",
        label: "Adresse email",
        icon: <Mail className="h-4 w-4" />,
    },
    {
        key: "number",
        label: "Téléphone",
        icon: <Phone className="h-4 w-4" />,
    },
    {
        key: "gender",
        label: "Genre",
        icon: <VenusAndMars className="h-4 w-4" />,
        render: (value) => {
            switch (value) {
                case "H":
                    return "Homme";

                case "F":
                    return "Femme";

                default:
                    return "Non renseigné";
            }
        },
    },
    {
        key: "direction",
        label: "Direction",
        icon: <Building2 className="h-4 w-4" />,
    },
    {
        key: "job",
        label: "Poste",
        icon: <BriefcaseBusiness className="h-4 w-4" />,
    },
    
    {
        key: "status",
        label: "Statut",
        icon: <CircleCheck className="h-4 w-4" />,
        render: (value) => (
            <span
                className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${
                    value
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                }`}
            >
                <span
                    className={`h-1.5 w-1.5 rounded-full ${
                        value ? "bg-emerald-500" : "bg-red-500"
                    }`}
                />
                {value ? "Actif" : "Inactif"}
            </span>
        ),
    },
    
    {
        key: "createdAt",
        label: "Date de création",
        icon: <CalendarDays className="h-4 w-4" />,
        render: (value) => {
            if (!value) {
                return "Non renseigné";
            }

            return new Date(String(value)).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });
        },
    },
    {
        key: "role",
        label: "Rôle",
        icon: <Shield className="h-4 w-4" />,
        render: (value) => String(value),
    },

    {
        key: "isActive",
        label: "Compte",
        icon: <CircleCheck className="h-4 w-4" />,
        render: (value) => (
            <span
                className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${
                    value
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                }`}
            >
                <span
                    className={`h-1.5 w-1.5 rounded-full ${
                        value ? "bg-emerald-500" : "bg-red-500"
                    }`}
                />
                {value ? "Activer" : "Désactiver"}
            </span>
        ),
    }
    ,
];