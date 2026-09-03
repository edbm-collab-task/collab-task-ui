import { useEffect, useRef, useMemo } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

interface SparklineProps {
    data: number[];
    color: string;
    fillColor?: string;
    height?: number;
    width?: number;
}

export default function Sparkline({
    data,
    color = "#3b82f6",
    fillColor,
    height = 40,
    width = 120,
}: SparklineProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<ChartJS | null>(null);

    const chartData = useMemo(() => {
        const labels = data.map((_, i) => i.toString());
        return {
            labels,
            datasets: [
                {
                    data,
                    borderColor: color,
                    backgroundColor: fillColor || `${color}20`,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    tension: 0.4,
                    fill: true,
                },
            ],
        };
    }, [data, color, fillColor]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
        },
        interaction: { mode: "index" as const, intersect: false },
        scales: {
            x: { display: false },
            y: { display: false },
        },
        elements: {
            line: { borderWidth: 2, tension: 0.4 },
            point: { radius: 0, hoverRadius: 4 },
        },
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Destroy existing chart if exists
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new ChartJS(canvas, {
            type: "line",
            data: chartData,
            options,
        });

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [chartData]);

    return (
        <div style={{ width, height }}>
            <canvas ref={canvasRef} width={width} height={height} />
        </div>
    );
}