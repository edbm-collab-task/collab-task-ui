import { useEffect } from "react";

/**
 * Hook pour détecter l'appui sur la touche Escape.
 * 
 * @param callback Fonction appelée quand Escape est pressé
 * @param enabled Active/désactive l'écoute (défaut: true)
 */
export function useEscapeKey(callback: () => void, enabled = true) {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                callback();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [callback, enabled]);
}