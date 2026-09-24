import { useCallback, useState } from "react";

/**
 * Gère un état booléen avec un toggle.
 * Utilisé par : UserDropdown, TableFilter, NotificationBell, ReactionPicker, AdminLayout.
 *
 * Retourne un tuple [value, toggle, setValue] :
 * - value : l'état courant (défaut: false)
 * - toggle : inverse l'état via mise à jour fonctionnelle (pas de stale closure)
 * - setValue : le setter classique
 */
export function useToggle(initialValue = false): [boolean, () => void, (value: boolean | ((prev: boolean) => boolean)) => void] {
    const [value, setValue] = useState(initialValue);

    const toggle = useCallback(() => setValue((current) => !current), []);

    return [value, toggle, setValue];
}