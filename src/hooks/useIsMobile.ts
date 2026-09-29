import { useEffect, useState } from "react";

/**
 * Détecte si la fenêtre est en dessous du breakpoint `md` de Tailwind (48rem = 768px).
 * L'état est initialisé de façon synchrone pour éviter un flash de la mauvaise vue
 * au premier rendu, puis resynchronisé et mis à jour à chaque redimensionnement.
 */
const MOBILE_QUERY = "(max-width: 767px)";

export function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState(
        () =>
            typeof window !== "undefined" &&
            window.matchMedia(MOBILE_QUERY).matches
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia(MOBILE_QUERY);

        const handleChange = (event: MediaQueryListEvent) => {
            setIsMobile(event.matches);
        };

        setIsMobile(mediaQuery.matches);
        mediaQuery.addEventListener("change", handleChange);

        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    return isMobile;
}
