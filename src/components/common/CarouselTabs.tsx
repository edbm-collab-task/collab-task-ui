import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface CarouselTab {
    id: string;
    label: string;
    icon?: LucideIcon;
}

interface CarouselTabsProps {
    tabs: CarouselTab[];
    activeId: string;
    onChange: (id: string) => void;
    children: ReactNode;
}

export function CarouselTabs({ tabs, activeId, onChange, children }: CarouselTabsProps) {
    const gridCols = tabs.length === 2 ? "grid-cols-2" : "grid-cols-3";
    return (
        <div className="space-y-4">
            <div className={`grid ${gridCols} gap-1 rounded-xl bg-[var(--color-bg)] p-1`}>
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const active = tab.id === activeId;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onChange(tab.id)}
                            className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition ${
                                active
                                    ? "bg-primary text-white shadow"
                                    : "text-primary hover:bg-primary/10"
                            }`}
                        >
                            {Icon && <Icon size={14} />}
                            {tab.label}
                        </button>
                    );
                })}
            </div>
            <div key={activeId} className="animate-fade-in space-y-4">
                {children}
            </div>
        </div>
    );
}