// components/ConfirmPopup.tsx
import { useEffect, useState } from "react";

type ConfirmPopupProps = {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "default";
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmPopup({
    open,
    title,
    message,
    confirmLabel = "Confirmer",
    cancelLabel = "Annuler",
    variant = "default",
    onConfirm,
    onCancel,
}: ConfirmPopupProps) {
    const [mounted, setMounted] = useState(open);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (open) {
            setMounted(true);
            requestAnimationFrame(() => setVisible(true));
        } else {
            setVisible(false);
            const timeout = setTimeout(() => setMounted(false), 200);
            return () => clearTimeout(timeout);
        }
    }, [open]);

    if (!mounted) return null;

    return (
        <div
            className={`fixed inset-0 h-full bg-black/50 flex items-center justify-center z-50 transition-opacity duration-200 ${
                visible ? "opacity-100" : "opacity-0"
            }`}
        >
            <div
                className={`bg-white rounded-lg p-6 max-w-sm w-full shadow-lg transition-all duration-200 ${
                    visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
            >
                <h3 className="text-lg font-semibold mb-2 text-primary">{title}</h3>
                <p className="text-sm text-primary/90 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 rounded text-primary hover:bg-secondary ">
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded text-white ${
                            variant === "danger" ? "bg-accent hover:bg-primary" : "bg-primary hover:bg-accent"
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}