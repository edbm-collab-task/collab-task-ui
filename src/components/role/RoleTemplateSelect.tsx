import { ChevronDown } from "lucide-react";

import type { RoleSummary } from "@/components/role/roleForm.types";

/**
 * Props du sélecteur de modèle {@link RoleTemplateSelect}.
 */
interface Props {
    /** Rôles existants proposés comme modèle de création. */
    roles: RoleSummary[];
    /** Identifiant du modèle sélectionné, ou `null` pour « partir de zéro ». */
    value: number | null;
    /** Notifie le choix d'un modèle (`null` = aucun modèle). */
    onChange: (id: number | null) => void;
    /** Désactive le sélecteur (chargement d'un modèle en cours, par exemple). */
    disabled?: boolean;
}

/**
 * Sélecteur « créer à partir d'un rôle existant ».
 *
 * Composant purement présentationnel : il ne charge aucune donnée et ignore
 * tout des permissions. Il signale simplement le modèle choisi au parent, qui
 * se charge de pré-remplir le formulaire (permissions uniquement ; le nom et
 * le code restent à saisir).
 */
export default function RoleTemplateSelect({
    roles,
    value,
    onChange,
    disabled = false,
}: Props) {
    return (
        <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
                Créer à partir d'un rôle existant (optionnel)
            </label>
            <div className="relative">
                <select
                    value={value ?? ""}
                    disabled={disabled}
                    onChange={(e) =>
                        onChange(e.target.value ? Number(e.target.value) : null)
                    }
                    className="w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 pr-9 text-sm focus:border-primary focus:outline-none disabled:bg-gray-100"
                >
                    <option value="">Partir de zéro</option>
                    {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                            {role.name}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
            </div>
            <p className="mt-1 text-xs text-gray-500">
                Les permissions et actions du rôle sélectionné seront
                pré-remplies. Le nom et le code restent à saisir.
            </p>
        </div>
    );
}
