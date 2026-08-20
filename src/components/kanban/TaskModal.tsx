import { useEffect, useState, useCallback } from "react";
import { X, Paperclip, Trash2, Download, Users } from "lucide-react";

import {
    PRIORITIES,
    STATUSES,
    type TaskReq,
    type TaskRes,
} from "@/types/task";
import type { Status } from "@/types/status";
import type { Contributor } from "@/types/contributor";
import type { TaskAttachment } from "@/types/attachment";
import { attachmentService } from "@/services/attachment/attachment.service";

interface Props {
    open: boolean;
    projectId: number;
    projectOwnerId?: number;
    task?: TaskRes | null;
    defaultStatusId?: number | null;
    tasks: TaskRes[];
    statuses?: Status[];
    contributors?: Contributor[];
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
    assigneeIds: [],
});

export default function TaskModal({
    open,
    projectId,
    projectOwnerId,
    task = null,
    defaultStatusId = null,
    tasks,
    statuses,
    contributors = [],
    onClose,
    onSubmit,
    submitting = false,
}: Props) {

    const fallbackStatuses: Status[] = STATUSES.map(s => ({
        statusId: s.id,
        name: s.name,
        sortOrder: 0,
    }));

    const availableStatuses = statuses ?? fallbackStatuses;
    const statusIdDefault = availableStatuses[0]?.statusId ?? 1;

    const [form, setForm] = useState<TaskReq>(
        emptyForm(projectId, statusIdDefault)
    );

    const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
    const [uploading, setUploading] = useState(false);

    const loadAttachments = useCallback(async (taskId: number) => {
        try {
            const data = await attachmentService.getAll(taskId);
            setAttachments(data);
        } catch {
            setAttachments([]);
        }
    }, []);

    useEffect(() => {
        if (!open) return;
        if (task) {
            setForm({
                title: task.title,
                description: task.description ?? "",
                dueDate: task.dueDate,
                projectId: task.projectId,
                priorityId: task.priorityId,
                statusId: task.statusId,
                parentTaskId: task.parentTaskId,
                assigneeIds: task.assignees?.map(a => a.userId) ?? [],
            });
            loadAttachments(task.taskId);
        } else {
            const defaultId = defaultStatusId ?? statusIdDefault;
            const defaultAssignees = projectOwnerId ? [projectOwnerId] : [];
            setForm({ ...emptyForm(projectId, defaultId), assigneeIds: defaultAssignees });
            setAttachments([]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, task?.taskId, projectId, defaultStatusId]);

    const handleFileUpload = async (file: File) => {
        if (!task) return;
        const taskId = task.taskId;
        setUploading(true);
        try {
            await attachmentService.upload(taskId, file);
            await loadAttachments(taskId);
        } catch {
            // error handled by interceptor
        } finally {
            setUploading(false);
        }
    };

    const openFilePicker = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".pdf,.doc,.docx,.xls,.xlsx,.csv";
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleFileUpload(file);
        };
        input.click();
    };

    const handleDeleteAttachment = async (attachmentId: number) => {
        if (!window.confirm("Supprimer cette pièce jointe ?")) return;
        try {
            await attachmentService.delete(attachmentId);
            if (task) await loadAttachments(task.taskId);
        } catch {
            // error handled by interceptor
        }
    };

    const toggleAssignee = (userId: number) => {
        setForm(prev => {
            const current = prev.assigneeIds ?? [];
            const updated = current.includes(userId)
                ? current.filter(id => id !== userId)
                : [...current, userId];
            return { ...prev, assigneeIds: updated };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        void onSubmit(form);
    };

    const inputClass = "w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
    const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500";

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " o";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " Ko";
        return (bytes / (1024 * 1024)).toFixed(1) + " Mo";
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
            onClick={onClose}
            style={{ visibility: open ? "visible" : "hidden", pointerEvents: open ? "auto" : "none" }}
        >
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

                    {/* Assignation des membres */}
                    {contributors.length > 0 && (
                        <div>
                            <label className={labelClass}>
                                <Users size={13} className="mr-1 inline" />
                                Assignés
                            </label>
                            <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 p-3">
                                {contributors.map(c => {
                                    const initials = (c.userName ?? "")
                                        .split(" ")
                                        .map(w => w[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2) || "?";
                                    const selected = form.assigneeIds?.includes(c.userId) ?? false;
                                    return (
                                        <button
                                            key={c.userId}
                                            type="button"
                                            onClick={() => toggleAssignee(c.userId)}
                                            title={c.userName}
                                            className={`relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition ${
                                                selected
                                                    ? "bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-1"
                                                    : "bg-gray-100 text-gray-500 ring-1 ring-gray-200 hover:ring-blue-300"
                                            }`}
                                        >
                                            {initials}
                                        </button>
                                    );
                                })}
                            </div>
                            {form.assigneeIds && form.assigneeIds.length > 0 && (
                                <p className="mt-1.5 text-xs text-gray-400">
                                    {form.assigneeIds.length} assigné{form.assigneeIds.length > 1 ? "s" : ""}
                                </p>
                            )}
                        </div>
                    )}

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
                            {task ? "Enregistrer" : "Créer la tâche"}
                        </button>
                    </div>
                </form>

                {/* Pièces jointes — hors du form pour éviter les conflits */}
                <div className="mt-4 border-t border-gray-200 pt-4">
                    <label className={labelClass}>
                        <Paperclip size={13} className="mr-1 inline" />
                        Pièces jointes ({attachments.length})
                    </label>
                    <div className="rounded-xl border border-gray-200 p-3 space-y-2">
                        {attachments.length > 0 && (
                            <div className="space-y-1">
                                {attachments.map(att => (
                                    <div key={att.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-700">{att.originalName}</p>
                                            <p className="text-xs text-gray-400">{formatSize(att.size)}</p>
                                        </div>
                                        <div className="flex items-center gap-1 ml-2">
                                            <a
                                                href={attachmentService.downloadUrl(att.id)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-200 hover:text-blue-600"
                                                title="Télécharger"
                                            >
                                                <Download size={14} />
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteAttachment(att.id)}
                                                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-200 hover:text-red-500"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div>
                            <button
                                type="button"
                                onClick={openFilePicker}
                                disabled={uploading || !task}
                                className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-medium text-gray-500 transition hover:border-blue-400 hover:text-blue-600 disabled:opacity-50"
                                title={!task ? "Créez la tâche puis réessayez" : ""}
                            >
                                <Paperclip size={13} />
                                {uploading ? "Envoi en cours…" : "Ajouter un fichier"}
                            </button>
                            {!task && (
                                <p className="mt-1 text-xs text-gray-400">Créez la tâche pour pouvoir ajouter des fichiers</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
