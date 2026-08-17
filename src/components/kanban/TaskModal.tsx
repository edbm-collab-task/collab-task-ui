import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";

import {
    PRIORITIES,
    STATUSES,
    type TaskReq,
    type TaskRes,
} from "@/types/task";
import type { Status } from "@/types/status";

interface Props {
    open: boolean;
    projectId: number;
    task?: TaskRes | null;
    defaultStatusId?: number | null;
    tasks: TaskRes[];
    statuses?: Status[];   // ← nouveau type
    onClose: () => void;
    onSubmit: (data: TaskReq) => Promise<void>;
    submitting?: boolean;
}

const emptyForm = (projectId: number, statusId: number): TaskReq => ({
    title: "",
    description: "",
    dueDate: null,
    projectId,
    priorityId: 2,
    statusId,
    parentTaskId: null,
});

export default function TaskModal({
    open,
    projectId,
    task = null,
    defaultStatusId = null,
    tasks,
    statuses,
    onClose,
    onSubmit,
    submitting = false,
}: Props) {

    // Convertir les STATUSES statiques en type Status[] pour le fallback
    const fallbackStatuses: Status[] = STATUSES.map(s => ({
        statusId: s.id,
        name: s.name,
        sortOrder: 0,
    }));

    const availableStatuses = statuses ?? fallbackStatuses;

    const [form, setForm] = useState<TaskReq>(
        emptyForm(projectId, availableStatuses[0]?.statusId ?? 1)
    );

    useEffect(() => {
        if (open) {
            if (task) {
                setForm({
                    title: task.title,
                    description: task.description ?? "",
                    dueDate: task.dueDate,
                    projectId: task.projectId,
                    priorityId: task.priorityId,
                    statusId: task.statusId,
                    parentTaskId: task.parentTaskId,
                });
            } else {
                // Utiliser defaultStatusId ou le premier statut disponible
                const defaultId = defaultStatusId ?? availableStatuses[0]?.statusId ?? 1;
                setForm(emptyForm(projectId, defaultId));
            }
        }
    }, [open, task, projectId, defaultStatusId, availableStatuses]);

    // 🔥 Condition pour cacher la modale
    if (!open) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        void onSubmit(form);
    };

    const inputClass = "w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
    const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-800">
                        {task ? "Modifier la tâche" : "Nouvelle tâche"}
                    </h3>
                    <button onClick={onClose} className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClass}>Titre *</label>
                        <input
                            autoFocus
                            className={inputClass}
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="Ex. Concevoir la maquette"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Description</label>
                        <textarea
                            className={`${inputClass} min-h-[90px] resize-y`}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Détails de la tâche…"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Priorité</label>
                            <select
                                className={inputClass}
                                value={form.priorityId}
                                onChange={(e) => setForm({ ...form, priorityId: Number(e.target.value) })}
                            >
                                {PRIORITIES.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Statut</label>
                            <select
                                className={inputClass}
                                value={form.statusId}
                                onChange={(e) => setForm({ ...form, statusId: Number(e.target.value) })}
                            >
                                {availableStatuses.map(s => (
                                    <option key={s.statusId} value={s.statusId}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Échéance</label>
                            <input
                                type="date"
                                className={inputClass}
                                value={form.dueDate ?? ""}
                                onChange={(e) => setForm({ ...form, dueDate: e.target.value || null })}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Tâche parente</label>
                            <select
                                className={inputClass}
                                value={form.parentTaskId ?? ""}
                                onChange={(e) => setForm({ ...form, parentTaskId: e.target.value ? Number(e.target.value) : null })}
                            >
                                <option value="">Aucune</option>
                                {tasks
                                    .filter(t => t.taskId !== task?.taskId)
                                    .map(t => (
                                        <option key={t.taskId} value={t.taskId}>{t.title}</option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !form.title.trim()}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting && <Loader2 size={16} className="animate-spin" />}
                            {task ? "Enregistrer" : "Créer la tâche"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}