import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CalendarDays, Save } from "lucide-react";
import Spinner from "@/components/common/Spinner";

import { projectService } from "@/services/project/project.service";

import type { ProjectReq } from "@/types/project";

interface ProjectForm {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
}

const emptyForm: ProjectForm = {
    title: "",
    description: "",
    startDate: "",
    endDate: "",
};

export default function ProjectFormPage({ mode }: { mode: "create" | "edit" }) {

    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = mode === "edit" && id;

    const [form, setForm] = useState<ProjectForm>(emptyForm);
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {

        const load = async () => {
            try {
                const project = isEdit ? await projectService.getById(Number(id)) : null;

                if (project) {
                    setForm({
                        title: project.title,
                        description: project.description ?? "",
                        startDate: project.startDate?.slice(0, 10) ?? "",
                        endDate: project.endDate?.slice(0, 10) ?? "",
                    });
                }
            } catch (error) {
                console.error(error);
                toast.error("Impossible de charger les données");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id, isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title.trim()) {
            toast.error("Le titre du projet est obligatoire");
            return;
        }

        const payload: ProjectReq = {
            title: form.title.trim(),
            description: form.description.trim(),
            startDate: form.startDate,
            endDate: form.endDate,
        };

        try {
            setSubmitting(true);

            if (isEdit) {
                await projectService.update(Number(id), payload);
            } else {
                await projectService.create(payload);
            }

            navigate("/admin/projects");
            setTimeout(() => toast.success(isEdit ? "Projet modifié avec succès" : "Projet créé avec succès"));
        } catch (error) {
            console.error(error);
            setTimeout(() => toast.error("Une erreur est survenue"));
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
    const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500";

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-400">
                <Spinner size={28} />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl">
            <button
                onClick={() => navigate("/admin/projects")}
                className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-blue-600"
            >
                <ArrowLeft size={16} />
                Retour aux projets
            </button>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
                    <h2 className="text-xl font-bold text-white">
                        {isEdit ? "Modifier le projet" : "Nouveau projet"}
                    </h2>
                    <p className="mt-1 text-sm text-blue-100">
                        {isEdit ? "Mettez à jour les informations du projet" : "Créez un projet et organisez ses tâches"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    <div>
                        <label className={labelClass}>Titre *</label>
                        <input
                            className={inputClass}
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="Ex. Refonte de la plateforme e-commerce"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Description</label>
                        <textarea
                            className={`${inputClass} min-h-[110px] resize-y`}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Objectifs, périmètre, contraintes…"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
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
                                value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/projects")}
                            className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting && <Spinner size={16} />}
                            <Save size={16} />
                            {isEdit ? "Enregistrer" : "Créer le projet"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
