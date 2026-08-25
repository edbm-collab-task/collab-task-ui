import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

interface Props {
    icon?: LucideIcon;
    title: string;
    description?: string;
    className?: string;
}

export default function EmptyState({ icon: Icon = Inbox, title, description, className = "" }: Props) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
            <Icon size={32} className="mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {description && (
                <p className="mt-1 max-w-xs text-xs text-gray-400">{description}</p>
            )}
        </div>
    );
}
