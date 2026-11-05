import type { RefObject } from "react";
import EmojiPickerPopover from "@/components/common/EmojiPickerPopover";

interface Props {
    open: boolean;
    anchorRef: RefObject<HTMLElement | null>;
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

/**
 * Sélecteur d'emojis du composeur de messages.
 * S'appuie sur le popover partagé (jeu complet, recherche, catégories, tons).
 */
const EmojiPicker = ({ open, anchorRef, onSelect, onClose }: Props) => {
    return (
        <EmojiPickerPopover
            open={open}
            anchorRef={anchorRef}
            onSelect={onSelect}
            onClose={onClose}
            autoFocusSearch
        />
    );
};

export default EmojiPicker;
