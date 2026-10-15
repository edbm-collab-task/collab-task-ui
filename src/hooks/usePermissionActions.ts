import { useContext } from "react";

import { PermissionActionsContext } from "@/contexts/PermissionActionsProvider";
import type { PermissionActionsContextValue } from "@/contexts/PermissionActionsProvider";

/**
 * Repli sûr hors `PermissionActionsProvider` : masques vides, donc
 * « masque inconnu » et non « aucun droit ». Les vérifications retombent
 * alors sur la seule présence de la permission (fail-open, voir
 * `usePermissions`).
 */
const FALLBACK: PermissionActionsContextValue = {
    grantedMasks: {},
    masksLoading: false,
    masksError: false,
    refreshMasks: async () => {}
};

/** Accès aux masques d'actions accordées à l'utilisateur courant. */
export default function usePermissionActions(): PermissionActionsContextValue {
    return useContext(PermissionActionsContext) ?? FALLBACK;
}
