import { useEffect, useRef } from "react";

/**
 * Hook pour détecter les clics en dehors d'un élément.
 * Retourne une ref à attacher à l'élément à surveiller.
 * 
 * @param callback Fonction appelée quand un clic est détecté en dehors
 * @param enabled Active/désactive l'écoute (défaut: true)
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
    callback: (event: MouseEvent) => void,
    enabled = true
) {
    const ref = useRef<T>(null);

    useEffect(() => {
        if (!enabled) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback(event);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [callback, enabled]);

    return ref;
}