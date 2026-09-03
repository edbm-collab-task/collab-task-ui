import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import { TrendingUp, BarChart3 } from "lucide-react";
import type { EvolutionPointResDto } from "@/types/adminDashboard";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface Props {
    evolution: EvolutionPointResDto[] | null;
}

export default function AdminEvolutionChart({ evolution }: Props) {
    const fontFamily = window.getComputedStyle(document.body).fontFamily;

    const points = evolution ?? [];
    const labels = points.map(point => point.label);
    const totalCreated = points.reduce((sum, p) => sum + p.created, 0);
    const totalCompleted = points.reduce((sum, p) => sum + p.completed, 0);

    const data = {
        labels,
        datasets: [
            {
                label: "Projets créés",
                data: points.map(point => point.created),
                borderColor: "rgba(59, 130, 246, 1)",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                tension: 0.4,
                fill: true,
            },
            {
                label: "Projets terminés",
                data: points.map(point => point.completed),
                borderColor: "rgba(16, 185, 129, 1)",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const options: ChartOptions<"line"> = {
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
                <h3 className="font-bold text-gray-800">Évolution des projets</h3>
                <TrendingUp size={18} className="text-gray-400" />
            </div>

            {points.length === 0 ? (
                <div className="flex h-48 items-center justify-center text-gray-400">
                    <div className="text-center">
                        <BarChart3 size={32} className="mx-auto text-gray-300" />
                        <p className="mt-2 text-sm text-gray-500">Aucune donnée d'évolution disponible</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="mb-5 flex items-center gap-6 text-sm">
                        <span className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                            <span className="text-gray-600">Créées</span>
                            <span className="font-bold text-gray-800">{totalCreated}</span>
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                            <span className="text-gray-600">Terminées</span>
                            <span className="font-bold text-gray-800">{totalCompleted}</span>
                        </span>
                    </div>

                    <div className="h-72 sm:h-80">
                        <Line data={data} options={options} />
                    </div>
                </>
            )}
        </div>
    );
}