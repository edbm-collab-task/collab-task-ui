import type { ReactNode } from "react";

import usePermissions from "@/hooks/usePermissions";
import type { ActionCode } from "@/constants/actions";
import type { PermissionName } from "@/constants/permissions";

/** Props de {@link Allow}. */
interface Props {
    /** Permission requise pour afficher le contenu. */
    perm: PermissionName;
    /**
     * Action exigée sur la permission. Optionnelle : sans elle, la seule
     * présence de la permission suffit. Avec elle, le bit est testé sur le
     * masque accordé reconstruit par `PermissionActionsProvider`.
     */
    action?: ActionCode;
    /** Contenu affiché si l'utilisateur a la permission. */
    children: ReactNode;
    /** Contenu de repli si la permission manque (par défaut : rien). */
    fallback?: ReactNode;
}

/**
 * Enveloppe conditionnelle basée sur les permissions.
 *
 * Affiche `children` uniquement si l'utilisateur courant possède `perm` et,
 * si `action` est fournie, le bit correspondant dans le masque accordé. Sinon
 * rend `fallback` (rien par défaut), sans jamais monter les enfants : les
 * effets et requêtes qu'ils portent ne sont donc pas déclenchés.
 *
 * ```tsx
 * <Allow perm={PERM.MANAGE_PROJECTS} action={ACT.INSERT}>
 *     <AddButton />
 * </Allow>
 * ```
 */
export default function Allow({
    perm,
    action,
    children,
    fallback = null
}: Props) {
    const { hasPermission } = usePermissions();

    if (!hasPermission(perm, action)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
