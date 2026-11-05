import { useRef } from "react";
import { SmilePlus } from "lucide-react";
import EmojiPickerPopover from "@/components/common/EmojiPickerPopover";
import { REACTION_EMOJIS } from "@/types/comment";
import { useToggle } from "@/hooks/useToggle";

interface Props {
    onSelect: (emoji: string) => void;
}

/**
 * Sélecteur de réaction d'un commentaire.
 * Ouvre le jeu complet d'emojis (recherche, catégories, tons) avec quelques
 * réactions suggérées en accès rapide. La règle métier reste une seule
 * réaction par utilisateur et par commentaire : sélectionner un autre emoji
 * remplace la réaction existante.
 */
export default function ReactionPicker({ onSelect }: Props) {
    const [open, toggleOpen, setOpen] = useToggle();
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                onClick={toggleOpen}
                aria-expanded={open}
                aria-haspopup="dialog"
                className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                title="Ajouter une réaction"
            >
                <SmilePlus size={14} />
            </button>

            <EmojiPickerPopover
                open={open}
                anchorRef={triggerRef}
                onSelect={onSelect}
                onClose={() => setOpen(false)}
                suggestedEmojis={REACTION_EMOJIS}
                autoFocusSearch={false}
                height={360}
            />
        </>
    );
}
