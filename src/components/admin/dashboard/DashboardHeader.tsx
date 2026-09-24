import { CalendarDays, Download, Filter, ChevronDown } from "lucide-react";
import { useState } from "react";
import { DASHBOARD_PERIODS, DASHBOARD_PERIOD_OPTIONS } from "@/types/dashboard";
import type { DashboardPeriod } from "@/types/dashboard";
import TableFilter from "@/components/table/TableFilter";
import { projectService } from "@/services/project/project.service";
import type { ProjectRes } from "@/types/project";
import { useClickOutside } from "@/hooks/useClickOutside";

interface Props {
    period: DashboardPeriod;
    onPeriodChange: (period: DashboardPeriod) => void;
    startDate: string;
    endDate: string;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    projects: ProjectRes[];
    selectedProjectId: number | "all";
    onProjectChange: (id: number | "all") => void;
    showProjectDropdown: boolean;
    setShowProjectDropdown: (v: boolean) => void;
    overdueCount: number;
    onOverdueClick: () => void;
}

const inputClass = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-primary/30 focus:ring-1 focus:ring-primary";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500";

export default function DashboardHeader({
    period,
    onPeriodChange,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    projects,
    selectedProjectId,
    onProjectChange,
    showProjectDropdown,
    setShowProjectDropdown,
    overdueCount: _overdueCount,
    onOverdueClick: _onOverdueClick,
}: Props) {

    const isCustom = period === DASHBOARD_PERIODS.CUSTOM;
    const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false), showProjectDropdown);
    const [isOpen, setIsOpen] = useState(false);

    const handleExportPdf = async () => {
        try {
            if (selectedProjectId === "all") {
                alert("Veuillez sélectionner un projet spécifique pour exporter un rapport.");
                return;
            }
            const params: { period: string; startDate?: string; endDate?: string } = { period };
            if (isCustom && startDate && endDate) {
                params.startDate = startDate;
                params.endDate = endDate;
            }
            const response = await projectService.exportPdf(selectedProjectId as number, params);
            let blob: Blob;
            if (response && typeof response === "object" && "data" in response) {
                blob = (response as any).data as Blob;
            } else {
                blob = response as Blob;
            }
            if (!(blob instanceof Blob)) {
                throw new Error("Le service n'a pas retourné un fichier valide.");
            }
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const projectTitle = projects.find(p => p.projectId === selectedProjectId)?.title || selectedProjectId;
            link.download = `rapport-projet-${projectTitle}-${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Erreur lors de l'export PDF :", error);
            alert("Impossible de générer le rapport. Veuillez réessayer.");
        }
    };

    const selectedProject = projects.find(p => p.projectId === selectedProjectId);

    return (
        <div>
            <div className="flex flex-col min-w-0 gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-primary">Tableau de bord</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Statistiques et performances de votre activité
                    </p>
                </div>

                <div className="flex flex-wrap  items-center gap-3 max-sm:grid max-sm:grid-cols-2">

                    <TableFilter<DashboardPeriod>
                        value={period}
                        options={DASHBOARD_PERIOD_OPTIONS}
                        onChange={onPeriodChange}
                        placeholder="Période"
                    />

                    {/* Project Filter Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => {
                                setShowProjectDropdown(!showProjectDropdown);
                                setIsOpen(!isOpen);
                            }}
                            className="inline-flex items-center gap-2 max-sm:gap-0.5 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md"
                        >
                            <Filter size={16} className="max-sm:size-3.5" />
                            <span className="truncate max-w-40 max-sm:max-w-22">
                                {selectedProject?.title ?? "Tous les projets"}
                            </span>
                            <ChevronDown size={16} className={isOpen ? "rotate-180" : ""} />
                        </button>

                        {isOpen && (
                            <div className="absolute right-0 mt-1 w-64 rounded-xl border border-gray-200 bg-white shadow-lg z-50 overflow-hidden">
                                <button
                                    onClick={() => {
                                        onProjectChange("all");
                                        setShowProjectDropdown(false);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-4 py-2 text-sm text-left transition ${
                                        selectedProjectId === "all"
                                            ? "bg-primary/10 text-accent"
                                            : "text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    Tous les projets
                                </button>
                                <div className="border-t border-gray-100 max-h-60 overflow-y-auto">
                                    {projects.map(p => (
                                        <button
                                            key={p.projectId}
                                            onClick={() => {
                                                onProjectChange(p.projectId);
                                                setShowProjectDropdown(false);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full px-4 py-2 text-sm text-left transition ${
                                                selectedProjectId === p.projectId
                                                    ? "bg-primary/10 text-accent"
                                                    : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                        >
                                            {p.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleExportPdf}
                        disabled={selectedProjectId === "all"}
                        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm transition max-sm:text-xs ${
                            selectedProjectId === "all"
                                ? "hidden!"
                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md"
                        }`}
                        title={selectedProjectId === "all" ? "Sélectionnez un projet pour exporter" : "Exporter en PDF"}
                    >
                        <Download size={16} />
                        Exporter en PDF
                    </button>

                </div>
            </div>

            {isCustom && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 px-1">
                    <div>
                        <label className={labelClass}>
                            <span className="inline-flex items-center gap-1">
                                <CalendarDays size={12} />
                                Date de début
                            </span>
                        </label>
                        <input
                            type="date"
                            className={inputClass}
                            value={startDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            max={endDate || undefined}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>
                            <span className="inline-flex items-center gap-1">
                                <CalendarDays size={12} />
                                Date de fin
                            </span>
                        </label>
                        <input
                            type="date"
                            className={inputClass}
                            value={endDate}
                            onChange={(e) => onEndDateChange(e.target.value)}
                            min={startDate || undefined}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
