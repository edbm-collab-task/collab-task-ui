import { createContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import useAuth from "@/hooks/useAuth";
import { roleService } from "@/services/role/role.service";
import type { RoleActionsMap } from "@/types/role";

/**
 * Masques d'actions accordées à l'utilisateur courant, par permission.
 *
 * Le backend n'expose pas les masques d'actions pour la session
 * (`/auth/me` ne renvoie que `permissions: string[]`). Ils sont donc
 * reconstruits côté client : le rôle de l'utilisateur est retrouvé dans
 * `GET /roles/actions-map` (dont le `label` correspond au nom du rôle), puis
 * `totalActionsAccordees` est aplati par nom de permission.
 */
export interface PermissionActionsContextValue {
    /** Masque accordé par nom de permission (`{ MANAGE_PROJECTS: 15 }`). */
    grantedMasks: Record<string, number>;
    /** Vrai pendant le chargement des masques. */
    masksLoading: boolean;
    /** Vrai si la reconstruction des masques a échoué (repli : masques vides). */
    masksError: boolean;
    /** Force le rechargement des masques depuis l'API. */
    refreshMasks(): Promise<void>;
}

export const PermissionActionsContext =
    createContext<PermissionActionsContextValue | undefined>(undefined);

const EMPTY_MASKS: Record<string, number> = {};

interface Props {
    children: ReactNode;
}

/**
 * Fournit les masques d'actions accordées à l'utilisateur connecté.
 *
 * À monter sous `AuthProvider` : les masques dépendent du rôle de la session
 * et sont recalculés à chaque connexion / changement de rôle.
 */
export default function PermissionActionsProvider({ children }: Props) {
    const { user } = useAuth();

    const [actionsMap, setActionsMap] = useState<RoleActionsMap>({});
    const [masksLoading, setMasksLoading] = useState(false);
    const [masksError, setMasksError] = useState(false);

    const role = user?.role;

    useEffect(() => {
        if (!role) {
            setActionsMap({});
            setMasksError(false);
            return;
        }

        let cancelled = false;
        setMasksLoading(true);

        roleService
            .getActionsMap({ silent: true })
            .then((map) => {
                if (cancelled) return;
                setActionsMap(map);
                setMasksError(false);
            })
            .catch(() => {
                if (cancelled) return;
                setActionsMap({});
                setMasksError(true);
            })
            .finally(() => {
                if (cancelled) return;
                setMasksLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [role]);

    const grantedMasks = useMemo<Record<string, number>>(() => {
        if (!role) return EMPTY_MASKS;

        const entry = Object.values(actionsMap).find(
            (roleActions) => roleActions.label === role
        );
        if (!entry) return EMPTY_MASKS;

        return Object.entries(entry.permissions).reduce<Record<string, number>>(
            (masks, [permission, actions]) => {
                masks[permission] = actions.totalActionsAccordees;
                return masks;
            },
            {}
        );
    }, [role, actionsMap]);

    const refreshMasks = async (): Promise<void> => {
        if (!role) return;

        setMasksLoading(true);
        try {
            const map = await roleService.getActionsMap({ silent: true });
            setActionsMap(map);
            setMasksError(false);
        } catch {
            setMasksError(true);
        } finally {
            setMasksLoading(false);
        }
    };

    return (
        <PermissionActionsContext.Provider
            value={{ grantedMasks, masksLoading, masksError, refreshMasks }}
        >
            {children}
        </PermissionActionsContext.Provider>
    );
}
