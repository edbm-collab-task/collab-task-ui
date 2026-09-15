import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import { TrendingUp, BarChart3 } from "lucide-react";
import type { DashboardEvolution } from "@/types/dashboard";
import EmptyState from "@/components/common/EmptyState";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
    evolution: DashboardEvolution | null;
}

export default function ActivityEvolutionChart({ evolution }: Props) {

    const fontFamily = window.getComputedStyle(document.body).fontFamily;

    const points = evolution?.points ?? [];
    const labels = points.map(point => point.label);

    const totalCreated = points.reduce((sum, p) => sum + p.created, 0);
    const totalCompleted = points.reduce((sum, p) => sum + p.completed, 0);

    const data = {
        labels,
        datasets: [
            {
                label: "Tâches créées",
                data: points.map(point => point.created),
                backgroundColor: "#d07694",
                hoverBackgroundColor: "#6d526f",
                borderRadius: 4,
                borderSkipped: false,
                barPercentage: 0.7,
                categoryPercentage: 0.65,
            },
            {
                label: "Tâches terminées",
                data: points.map(point => point.completed),
                backgroundColor: "#dddbff",
                hoverBackgroundColor: "#6d526f",
                borderRadius: 4,
                borderSkipped: false,
                barPercentage: 0.7,
                categoryPercentage: 0.65,
            },
        ],
    };

    const options: ChartOptions<"bar"> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: "index" as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: "bottom" as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 10,
                    boxHeight: 10,
                    padding: 20,
                    color: "#6b7280",
                    font: { family: fontFamily, size: 12 },
                },
            },
            tooltip: {
                backgroundColor: "#1f2937",
                padding: 12,
                cornerRadius: 8,
                titleFont: { family: fontFamily },
                bodyFont: { family: fontFamily },
                bodySpacing: 6,
                displayColors: true,
                usePointStyle: true,
                boxWidth: 10,
                boxHeight: 10,
                callbacks: {
                    title: (items) => items[0]?.label ?? "",
                    label: (context) => {
                        const label = context.dataset.label ?? "";
                        return `${label} : ${context.raw}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: {
                    color: "#9ca3af",
                    maxTicksLimit: 8,
                    maxRotation: 0,
                    font: { family: fontFamily, size: 11 },
                },
            },
            y: {
                beginAtZero: true,
                grid: { color: "#f3f4f6" },
                border: { display: false },
                ticks: {
                    color: "#9ca3af",
                    precision: 0,
                    font: { family: fontFamily, size: 11 },
                },
            },
        },
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-primary">Évolution de l&apos;activité</h3>
                <TrendingUp size={18} className="text-gray-400" />
            </div>

            {points.length === 0 ? (
                <EmptyState
                    icon={BarChart3}
                    title="Aucune donnée disponible"
                    description="L'évolution de l'activité apparaîtra ici lorsque les données seront disponibles."
                />
            ) : (
                <>
                    <div className="mb-5 flex items-center gap-6 text-sm">
                        <span className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-sm bg-accent" />
                            <span className="text-gray-600">Créées</span>
                            <span className="font-bold text-primary">{totalCreated}</span>
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-sm bg-secondary" />
                            <span className="text-gray-600">Terminées</span>
                            <span className="font-bold text-primary">{totalCompleted}</span>
                        </span>
                    </div>

                    <div className="h-72 sm:h-80">
                        <Bar data={data} options={options} />
                    </div>
                </>
            )}
        </div>
    );
}
