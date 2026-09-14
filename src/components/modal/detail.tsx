import { FileText, X} from "lucide-react";
import type { ReactNode } from "react";

export type DetailField<T> = {
    key: keyof T;
    label: string;
    icon?: ReactNode;
    fullWidth?: boolean;
    render?: (value: T[keyof T], data: T) => ReactNode;
    hidden?: (data: T) => boolean;
};

type DetailModalProps<T> = {
    open: boolean;
    data: T | null;
    title: string;
    description?: string;
    fields: DetailField<T>[];
    onClose: () => void;
    children?: ReactNode;
    closeLabel?: string;
    pdfUrl?: string;
};

export function DetailModal<T>({
    open,
    data,
    title,
    fields,
    onClose,
    children,
    pdfUrl,
}: DetailModalProps<T>) {
    if (!open || !data) {
        return null;
    }

    const visibleFields = fields.filter(
        (field) => !field.hidden || !field.hidden(data)
    );

    return (
        <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
            role="dialog"
            aria-modal="true"
        >
            <div className="relative flex h-[94%] max-h-[900px] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 dark:border-slate-800 dark:bg-slate-950">

                {/* Header */}
                <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-7">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="min-w-0">
                            <h2 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">
                                {title}
                            </h2>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fermer"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </header>

                {/* Content */}
                <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 dark:bg-slate-950">
                    <div className="p-4 sm:p-7">

                        {/* Formulaire en lecture seule */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            {visibleFields.map((field, index) => {
                                const value = data[field.key];

                                const isLast =
                                    index === visibleFields.length - 1;

                                const isOdd =
                                    visibleFields.length % 2 !== 0;

                                const shouldCenter =
                                    isLast &&
                                    isOdd &&
                                    !field.fullWidth;

                                return (
                                    <div
                                        key={String(field.key)}
                                        className={`${field.fullWidth ? "sm:col-span-2" : ""} ${shouldCenter ? "sm:col-start-1 sm:col-end-3 sm:mx-auto sm:w-[calc(50%-0.625rem)]" : ""}`}
                                    >
                                        {/* Label */}
                                        <div className="mb-1.5 flex items-center gap-2">
                                            {field.icon && (
                                                <span className="text-slate-400 dark:text-slate-500">
                                                    {field.icon}
                                                </span>
                                            )}

                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
                                                {field.label}
                                            </label>
                                        </div>

                                        {/* Champ readonly */}
                                        <div className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                            <div className="min-w-0 break-words leading-relaxed [overflow-wrap:anywhere]">
                                                {field.render
                                                    ? field.render(value, data)
                                                    : renderReadonlyValue(value)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Contenu personnalisé */}
                        {children && (
                            <div className="mt-6">
                                {children}
                            </div>
                        )}

                        {/* PDF */}
                        {pdfUrl && (
                            <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-950/30">
                                        <FileText className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                            Document PDF
                                        </p>

                                        <p className="text-xs text-slate-400">
                                            Aperçu du document
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-slate-100 p-2 dark:bg-slate-950 sm:p-3">
                                    <iframe
                                        src={pdfUrl}
                                        title="Document PDF"
                                        className="h-[400px] w-full rounded-lg bg-white sm:h-[500px] lg:h-[600px]"
                                    />
                                </div>
                            </section>
                        )}
                    </div>
                </main>

                {/* Footer */}
                <footer className="flex shrink-0 justify-end border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 sm:px-7 sm:py-4">
                    
                </footer>
            </div>
        </div>
    );
}

/**
 * Affichage des valeurs comme des champs
 * de formulaire déjà remplis.
 */
function renderReadonlyValue(value: unknown): ReactNode {
    if (value === null || value === undefined || value === "") {
        return (
            <span className="text-slate-400 dark:text-slate-500">
                Non renseigné
            </span>
        );
    }

    if (typeof value === "boolean") {
        return (
            <span
                className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${
                    value
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                }`}
            >
                <span
                    className={`h-1.5 w-1.5 rounded-full ${
                        value ? "bg-emerald-500" : "bg-red-500"
                    }`}
                />

                {value ? "Actif" : "Inactif"}
            </span>
        );
    }

    if (typeof value === "number") {
        return value.toLocaleString("fr-FR");
    }

    if (value instanceof Date) {
        return value.toLocaleString("fr-FR");
    }

    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value)) {
        return (
            <div className="flex flex-wrap gap-2">
                {value.map((item, index) => (
                    <span
                        key={index}
                        className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                        {typeof item === "object"
                            ? "Élément"
                            : String(item)}
                    </span>
                ))}
            </div>
        );
    }

    if (typeof value === "object") {
        return (
            <span className="text-slate-500 dark:text-slate-400">
                Informations disponibles
            </span>
        );
    }

    return String(value);
}