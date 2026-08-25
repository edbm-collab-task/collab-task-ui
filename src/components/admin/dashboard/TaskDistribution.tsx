import { TrendingUp } from "lucide-react";
import type { DashboardTaskDistribution } from "@/types/dashboard";

interface Props {
    distribution: DashboardTaskDistribution;
}

export default function TaskDistribution({ distribution }: Props) {

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Répartition des tâches</h3>
                <TrendingUp size={18} className="text-gray-400" />
            </div>

            <div className="space-y-4">
                {distribution.items.map(item => (
                    <div key={item.key}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 font-medium text-gray-600">
                                <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                                {item.name}
                            </span>
                            <span className="font-semibold text-gray-800">{item.count}</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                            <div
                                className={`h-full rounded-full ${item.color}`}
                                style={{
                                    width: distribution.total === 0
                                        ? "0%"
                                        : `${(item.count / distribution.total) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
