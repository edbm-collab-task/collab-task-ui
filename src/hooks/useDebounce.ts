import { useEffect, useState } from "react";

/**
 * Retarde la propagation d'une valeur jusqu'à ce qu'elle cesse de changer
 * pendant `delay` millisecondes.
 *
 * <p>Utilisé pour la recherche de messages : chaque frappe déclencherait sinon
 * une requête réseau, le terme n'étant généralement définitif qu'après une
 * courte pause.
 */
export function useDebounce<T>(
    value: T,
    delay = 300
): T {

    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timeout = setTimeout(
            () => setDebounced(value),
            delay
        );

        return () => clearTimeout(timeout);
    }, [value, delay]);

    return debounced;
}
