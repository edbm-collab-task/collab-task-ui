export interface ConfirmConfig {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: "danger" | "default";
    onConfirm: () => void;
}