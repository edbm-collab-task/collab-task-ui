import { useCallback, useState } from "react";

/**
 * Gère une liste de sélections multiples (ids) avec un toggle par élément.
 * Utilisé par : CreateGroupModal, GroupMembersModal.
 */
export function useMultiSelect<T>(initial: T[] = []) {
    const [selected, setSelected] = useState<T[]>(initial);

    const toggle = useCallback((id: T) => {
        setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    }, []);

    return { selected, setSelected, toggle };
}