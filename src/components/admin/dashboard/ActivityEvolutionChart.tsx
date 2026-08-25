import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { TrendingUp } from "lucide-react";
import type { DashboardEvolution } from "@/types/dashboard";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

interface Props {
    evolution: DashboardEvolution;
}

export default function ActivityEvolutionChart({ evolution }: Props) {

    const fontFamily = window.getComputedStyle(document.body).fontFamily;

    const labels = evolution.points.map(point => point.label);

    const data = {
        labels,
        datasets: [
            {
                label: "Taches cree\u00E9es",
                data: evolution.points.map(point => point.created),
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.08)",
                fill: true,
                tension: 0.35,
                pointRadius: 3,
                pointHoverRadius: 5,
                pointBackgroundColor: "#3b82f6",
            },
            {
                label: "Taches termin\u00E9es",
                data: evolution.points.map(point => point.completed),
                borderColor: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.08)",
                fill: true,
                tension: 0.35,
                pointRadius: 3,
                pointHoverRadius: 5,
                pointBackgroundColor: "#10b981",
            },
        ],
    };

    const options = {
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
                    boxWidth: 8,
                    boxHeight: 8,
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
                displayColors: true,
                usePointStyle: true,
                boxWidth: 8,
                boxHeight: 8,
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
            <div className="mb-5 flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Evolution de l&apos;activit\u00E9</h3>
                <TrendingUp size={18} className="text-gray-400" />
            </div>

            {evolution.points.length === 0 ? (
                <p className="py-16 text-center text-sm text-gray-400">Aucune donn\u00E9e sur la p\u00E9riode s\u00E9lectionn\u00E9e</p>
            ) : (
                <div className="h-72 sm:h-80">
                    <Line data={data} options={options} />
                </div>
            )}
        </div>
    );
}
