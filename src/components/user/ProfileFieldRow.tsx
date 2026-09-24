import type { ReactNode } from "react";

interface ProfileFieldRowProps {
    icon: ReactNode;
    label: string;
    value: string;
    fallback?: string;
    variant?: "default" | "badge";
}

export default function ProfileFieldRow({
    icon,
    label,
    value,
    fallback = "Non renseigné",
    variant = "default",
}: ProfileFieldRowProps) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                {icon}
            </div>

            <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    {label}
                </p>

                {variant === "badge" ? (
                    <div className="mt-1">
                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            {value || fallback}
                        </span>
                    </div>
                ) : (
                    <p className="mt-1 text-sm font-medium text-gray-900">
                        {value || fallback}
                    </p>
                )}
            </div>
        </div>
    );
}