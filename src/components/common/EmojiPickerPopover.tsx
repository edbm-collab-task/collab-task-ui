import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { EmojiClickData } from "emoji-picker-react";
import type { RefObject } from "react";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

/**
 * Dataset français chargé à la demande : la recherche porte sur les noms
 * français des emojis et le fichier est séparé du bundle initial.
 * La fonction est déclarée au niveau module pour conserver son identité.
 */
const loadFrenchEmojiData = () => import("emoji-picker-react/data/emojis-fr");

const FRENCH_LABELS = {
    searchPlaceholder: "Rechercher un emoji",
    searchLabel: "Rechercher un emoji",
    searchClear: "Effacer la recherche",
    searchResultsNone: "Aucun emoji trouvé",
    searchResultsOne: "1 emoji trouvé",
    searchResultsMany: "%n emojis trouvés",
    categoryNavigation: "Catégories d'emojis",
    loading: "Chargement des emojis...",
    loadingError: "Impossible de charger les emojis",
    retryLoading: "Réessayer",
    skinToneNeutral: "Ton neutre",
    skinToneLight: "Peau claire",
    skinToneMediumLight: "Peau moyennement claire",
    skinToneMedium: "Peau médium",
    skinToneMediumDark: "Peau moyennement foncée",
    skinToneDark: "Peau foncée",
};

const PICKER_WIDTH = 320;
const VIEWPORT_MARGIN = 8;
const ANCHOR_GAP = 8;

interface Props {
    open: boolean;
    anchorRef: RefObject<HTMLElement | null>;
    onSelect: (emoji: string) => void;
    onClose: () => void;
    suggestedEmojis?: string[];
    autoFocusSearch?: boolean;
    height?: number;
}

/**
 * Popover d'emojis partagé (composeur de messages et réactions).
 *
 * - rendu dans un portail pour ne pas être rogné par les conteneurs parents ;
 * - position calculée au-dessus ou en dessous du déclencheur selon l'espace ;
 * - fermeture au clic extérieur, sur Échap ou après sélection.
 */
const EmojiPickerPopover = ({
    open,
    anchorRef,
    onSelect,
    onClose,
    suggestedEmojis,
    autoFocusSearch = true,
    height = 340,
}: Props) => {
    const popoverRef = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

    const updatePosition = useCallback(() => {
        const anchor = anchorRef.current;
        if (!anchor) return;

        const rect = anchor.getBoundingClientRect();
        const width = Math.min(PICKER_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
        const pickerHeight = Math.min(height, window.innerHeight - VIEWPORT_MARGIN * 2);

        const spaceAbove = rect.top;
        const spaceBelow = window.innerHeight - rect.bottom;
        const shouldOpenAbove = spaceAbove >= pickerHeight + ANCHOR_GAP || spaceAbove >= spaceBelow;

        const rawTop = shouldOpenAbove ? rect.top - pickerHeight - ANCHOR_GAP : rect.bottom + ANCHOR_GAP;
        const rawLeft = rect.left;

        setPosition({
            top: Math.max(VIEWPORT_MARGIN, Math.min(rawTop, window.innerHeight - pickerHeight - VIEWPORT_MARGIN)),
            left: Math.max(VIEWPORT_MARGIN, Math.min(rawLeft, window.innerWidth - width - VIEWPORT_MARGIN)),
        });
    }, [anchorRef, height]);

    useLayoutEffect(() => {
        if (!open) {
            setPosition(null);
            return;
        }

        updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);

        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [open, updatePosition]);

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as Node;

            if (popoverRef.current?.contains(target)) return;
            if (anchorRef.current?.contains(target)) return;

            onClose();
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose, anchorRef]);

    if (!open || !position) return null;

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        onSelect(emojiData.emoji);
        onClose();
    };

    return createPortal(
        <div
            ref={popoverRef}
            role="dialog"
            aria-label="Sélecteur d'emoji"
            className="collab-emoji-picker fixed z-[70] overflow-hidden rounded-xl border border-primary/20 bg-white shadow-xl"
            style={{ top: position.top, left: position.left, width: PICKER_WIDTH }}
        >
            <Suspense
                fallback={
                    <div className="flex items-center justify-center text-sm text-primary/60" style={{ height }}>
                        Chargement des emojis...
                    </div>
                }
            >
                <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    emojiData={loadFrenchEmojiData}
                    labels={FRENCH_LABELS}
                    theme="light"
                    cssLayer="epr"
                    width={PICKER_WIDTH}
                    height={height}
                    previewConfig={{ showPreview: false }}
                    autoFocusSearch={autoFocusSearch}
                    suggestedEmojis={suggestedEmojis}
                />
            </Suspense>
        </div>,
        document.body,
    );
};

export default EmojiPickerPopover;
