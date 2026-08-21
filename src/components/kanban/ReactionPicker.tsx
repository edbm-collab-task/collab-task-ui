import { useState, useRef, useEffect } from "react";
import { SmilePlus } from "lucide-react";
import { REACTION_EMOJIS } from "@/types/comment";

interface Props {
    onSelect: (emoji: string) => void;
}

export default function ReactionPicker({ onSelect }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                title="Ajouter une réaction"
            >
                <SmilePlus size={14} />
            </button>
            {open && (
                <div className="absolute bottom-full left-0 z-10 mb-1 flex gap-1 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
                    {REACTION_EMOJIS.map(emoji => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                                onSelect(emoji);
                                setOpen(false);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition hover:bg-gray-100 hover:scale-110"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
