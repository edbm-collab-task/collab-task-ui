import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { X, Paperclip, Trash2, Download, Users, Search, Info, CalendarClock } from "lucide-react";
import toast from "react-hot-toast";

import {
    PRIORITIES,
    STATUSES,
    type TaskReq,
    type TaskRes,
} from "@/types/task";
import type { Status } from "@/types/status";
import { toStatusListFromSeed } from "@/mappers/status.mapper";
import type { Contributor } from "@/types/contributor";
import type { TaskAttachment } from "@/types/attachment";
import { attachmentService } from "@/services/attachment/attachment.service";
import { getInitialsFromName } from "@/utils/avatar";
import { formatFileSizeFr } from "@/utils/format";
import { useClickOutside } from "@/hooks/useClickOutside";
import { ConfirmPopup } from "../common/ConfirmPopup";
import { CarouselTabs } from "../common/CarouselTabs";

interface Props {
    open: boolean;
    projectId: number;
    task?: TaskRes | null;
    defaultStatusId?: number | null;
    tasks: TaskRes[];
    statuses?: Status[];
    contributors?: Contributor[];
    onClose: () => void;
    onSubmit: (data: TaskReq) => Promise<void>;
    submitting?: boolean;
}

/** Formulaire vide pré-rempli avec le projectId et le statusId par défaut */
const emptyForm = (projectId: number, statusId: number): TaskReq => ({
    title: "",
    description: "",
    dueDate: null,
    projectId,
    priorityId: 2, // Priorité "Moyenne" par défaut (seed backend)
    statusId,
    parentTaskId: null,
    assigneeIds: [],
});

const ALL_TABS = [
    { id: "details", label: "Détails", icon: Info },
    { id: "organisation", label: "Organisation", icon: CalendarClock },
    { id: "pieces", label: "Pièces jointes", icon: Paperclip },
];

interface AssigneePickerProps {
    contributors: Contributor[];
    selectedIds: number[];
    onToggle: (userId: number) => void;
}

function AssigneePicker({ contributors, selectedIds, onToggle }: AssigneePickerProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useClickOutside<HTMLDivElement>(() => setOpen(false));
    const inputRef = useRef<HTMLInputElement>(null);

    const selected = contributors.filter(c => selectedIds.includes(c.userId));

    // Filtrage côté client : exclut les déjà sélectionnés, filtre par nom/email
    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        return contributors.filter(c => {
            if (selectedIds.includes(c.userId)) return false;
            if (!q) return true;
            return (c.userName ?? "").toLowerCase().includes(q)
                || (c.userEmail ?? "").toLowerCase().includes(q);
        });
    }, [contributors, selectedIds, query]);

    const handlePick = (userId: number) => {
        onToggle(userId);
        setQuery("");
        inputRef.current?.focus();
    };

    return (
        <div className="space-y-2">
            <div className="flex min-h-[56px] flex-wrap items-center gap-2 rounded-xl border border-primary/30 p-3">
                {selected.map(c => (
                    <button
                        key={c.userId}
                        type="button"
                        onClick={() => onToggle(c.userId)}
                        title={`${c.userName} — cliquer pour désassigner`}
                        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white ring-1 ring-accent ring-offset-1 transition hover:opacity-80"
                    >
                        {getInitialsFromName(c.userName)}
                    </button>
                ))}
                {selected.length === 0 && (
                    <span className="text-xs text-primary/50">Aucun membre assigné.</span>
                )}
            </div>

            <div ref={containerRef} className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary/50" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                    placeholder="Rechercher un membre à assigner…"
                    className="w-full rounded-xl border border-primary/30 py-2.5 pl-9 pr-3 text-sm text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
                {open && (
                    <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-primary/30 bg-[var(--color-bg)] py-1 shadow-lg custom-scrollbar">
                        {results.length > 0 ? (
                            results.map(c => (
                                <button
                                    key={c.userId}
                                    type="button"
                                    onClick={() => handlePick(c.userId)}
                                    className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-primary/10"
                                >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-primary">
                                        {getInitialsFromName(c.userName)}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-medium text-primary">{c.userName}</span>
                                        <span className="block truncate text-[11px] text-primary/60">{c.userEmail}</span>
                                    </span>
                                </button>
                            ))
                        ) : (
                            <p className="px-3 py-2 text-xs text-primary/60">Aucun résultat.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TaskModal({
    open,
    projectId,
    task = null,
    defaultStatusId = null,
    tasks,
    statuses,
    contributors = [],
    onClose,
    onSubmit,
    submitting = false,
}: Props) {

    // Fallback sur les statuts "en dur" (seed backend) si l'API ne renvoie pas de statuts personnalisés
    // STATUSES = [{id:1,name:"A faire"}, {id:2,name:"En cours"}, {id:3,name:"Terminé"}]
    const fallbackStatuses: Status[] = toStatusListFromSeed(STATUSES);

    const availableStatuses = statuses ?? fallbackStatuses;
    const statusIdDefault = availableStatuses[0]?.statusId ?? 1;

    const tabs = useMemo(() =>
        task ? ALL_TABS : ALL_TABS.filter(t => t.id !== "pieces"),
        [task],
    );

    const [form, setForm] = useState<TaskReq>(
        emptyForm(projectId, statusIdDefault)
    );

    const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
    const [uploading, setUploading] = useState(false);

    // État unique pour toutes les confirmations (suppression pièce jointe)
    // Évite de multiplier les ConfirmPopup dans le JSX
    const [activeTab, setActiveTab] = useState("details");

    // --- État pour la gestion de la ConfirmPopup ---
    const [confirmConfig, setConfirmConfig] = useState<{
        open: boolean;
        title: string;
        message: string;
        confirmLabel?: string;
        variant?: "danger" | "default";
        onConfirm: () => void;
    }>({
        open: false,
        title: "",
        message: "",
        onConfirm: () => {},
    });

    const closeConfirm = () => {
        setConfirmConfig(prev => ({ ...prev, open: false }));
    };

    const loadAttachments = useCallback(async (taskId: number) => {
        try {
            const data = await attachmentService.getAll(taskId);
            setAttachments(data);
        } catch {
            setAttachments([]);
        }
    }, []);

    // Synchronisation du formulaire à l'ouverture de la modale :
    // - Si édition : on pré-remplit depuis la tâche existante + on charge les pièces jointes
    // - Si création : on réinitialise avec le statut par défaut (ou celui passé par la colonne Kanban)
    // Déps réduites intentionnellement (eslint-disable) : on ne veut recharger que si open/taskId changent,
    // pas à chaque changement de `task` (objet) ou `projectId` (stable)
    useEffect(() => {
        if (!open) return;
        setActiveTab("details");
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
            setForm(emptyForm(projectId, defaultId));
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
            // error handled by interceptor (toast global)
        } finally {
            setUploading(false);
        }
    };

    // Création dynamique d'un input file pour déclencher le sélecteur natif
    // Accept限定 les types bureautiques courants (pas d'images ici, gérées côté commentaires)
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

    // Suppression de pièce jointe avec ConfirmPopup (cohérence avec le reste de l'app)
    const handleDeleteAttachment = (attachmentId: number, attachmentName?: string) => {
        setConfirmConfig({
            open: true,
            title: "Supprimer la pièce jointe",
            message: `Voulez-vous vraiment supprimer ${attachmentName ? `« ${attachmentName} »` : "cette pièce jointe"} ?`,
            confirmLabel: "Supprimer",
            variant: "danger",
            onConfirm: async () => {
                closeConfirm();
                try {
                    await attachmentService.delete(attachmentId);
                    if (task) await loadAttachments(task.taskId);
                    setTimeout(() => toast.success("Pièce jointe supprimée"));
                } catch {
                    // error handled by interceptor
                }
            },
        });
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

    const activeTabIndex = tabs.findIndex(t => t.id === activeTab);

    const isFirstStep = activeTabIndex <= 0;
    const isLastStep = activeTabIndex === tabs.length - 1;

    const navigateTab = (direction: "next" | "prev") => {
        if (direction === "next" && activeTabIndex < tabs.length - 1) {
            setActiveTab(tabs[activeTabIndex + 1].id);
        } else if (direction === "prev" && activeTabIndex > 0) {
            setActiveTab(tabs[activeTabIndex - 1].id);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) return;

        // Date d'échéance obligatoire (règle métier)
        if (!form.dueDate) {
            toast.error("La date d'échéance est obligatoire");
            return;
        }

        // Validation date passée : on autorise seulement si la date n'a pas été modifiée
        // (cas édition où la date d'origine était déjà passée)
        const today = new Date().toISOString().slice(0, 10);
        const dueDateChanged = form.dueDate !== (task?.dueDate ?? null);
        if (dueDateChanged && form.dueDate < today) {
            toast.error("La date d'échéance ne peut pas être dans le passé");
            return;
        }

        void onSubmit(form);
    };

    const inputClass = "w-full rounded-xl border border-primary/30 px-4 py-2.5 text-sm text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30";
    const labelClass = "mb-1.5 block text-xs font-semibold tracking-wide text-primary/80";
    const obliLabelCalss = labelClass + " text-accent!"


    const today = new Date().toISOString().slice(0, 10);
    const originalDueDate = task?.dueDate ?? null;
    // dueMin pour l'input date : si la date d'origine est dans le passé, on la garde comme min
    // pour ne pas forcer l'utilisateur à la changer s'il ne touche pas au champ
    const dueMin = originalDueDate && originalDueDate < today ? originalDueDate : today;

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)]/60 p-4 backdrop-blur-sm"
                onClick={onClose}
                style={{ visibility: open ? "visible" : "hidden", pointerEvents: open ? "auto" : "none" }}
            >
                <div
                    className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-[var(--color-bg)] shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-6 pb-4">
                        <h3 className="text-xl font-bold text-primary">
                            {task ? "Modifier la tâche" : "Nouvelle tâche"}
                        </h3>
                        <button onClick={onClose} className="rounded-lg p-2 text-primary/60 transition hover:bg-primary/10 hover:text-primary">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2 custom-scrollbar">
                            <CarouselTabs tabs={tabs} activeId={activeTab} onChange={setActiveTab}>
                                {activeTab === "details" && (
                                    <>
                                        <div>
                                            <label className={obliLabelCalss }>Titre *</label>
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
                                    </>
                                )}

                                {activeTab === "organisation" && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={obliLabelCalss}>Échéance *</label>
                                                <input
                                                    type="date"
                                                    className={inputClass}
                                                    value={form.dueDate ?? ""}
                                                    min={dueMin}
                                                    required
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

                                        {contributors.length > 0 && (
                                            <div>
                                                <label className={labelClass}>
                                                    <Users size={13} className="mr-1 inline" />
                                                    Assignés
                                                </label>
                                                <AssigneePicker
                                                    contributors={contributors}
                                                    selectedIds={form.assigneeIds ?? []}
                                                    onToggle={toggleAssignee}
                                                />
                                                {form.assigneeIds && form.assigneeIds.length > 0 && (
                                                    <p className="mt-1.5 text-xs text-primary/60">
                                                        {form.assigneeIds.length} assigné{form.assigneeIds.length > 1 ? "s" : ""}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                {activeTab === "pieces" && (
                                    <div>
                                        <label className={labelClass}>
                                            <Paperclip size={13} className="mr-1 inline" />
                                            Pièces jointes ({attachments.length})
                                        </label>
                                        <div className="rounded-xl border border-primary/30 p-3 space-y-2">
                                            {attachments.length > 0 && (
                                                <div className="space-y-1">
                                                    {attachments.map(att => (
                                                        <div key={att.id} className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2">
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-medium text-primary">{att.originalName}</p>
                                                                <p className="text-xs text-primary/60">{formatFileSizeFr(att.size)}</p>
                                                            </div>
                                                            <div className="flex items-center gap-1 ml-2">
                                                                <a
                                                                    href={attachmentService.downloadUrl(att.id)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="rounded-lg p-1.5 text-primary/60 transition hover:bg-primary/10 hover:text-primary"
                                                                    title="Télécharger"
                                                                >
                                                                    <Download size={14} />
                                                                </a>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteAttachment(att.id, att.originalName)}
                                                                    className="rounded-lg p-1.5 text-primary/60 transition hover:bg-primary/10 hover:text-accent"
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
                                                    disabled={uploading}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-dashed border-primary/30 px-3 py-2 text-xs font-medium text-primary transition hover:border-accent hover:text-accent disabled:opacity-50"
                                                >
                                                    <Paperclip size={13} />
                                                    {uploading ? "Envoi en cours…" : "Ajouter un fichier"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CarouselTabs>
                        </div>

                        <div className="flex justify-end gap-3 p-6 pt-3">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigateTab('prev');                                    
                                }}
                                disabled={isFirstStep}
                                className="rounded-xl px-5 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:opacity-50"
                            >
                                Précédent
                            </button>
                            {isLastStep ? (
                                <button
                                    key="submit"
                                    type="submit"
                                    disabled={submitting || !form.title.trim()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {task ? "Enregistrer" : "Créer la tâche"}
                                </button>
                            ) : (
                                <button
                                    key="next"
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigateTab('next');
                                    }}
                                    disabled={!form.title.trim()}
                                    className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-accent bg-primary disabled:cursor-not-allowed disabled:bg-secondary"
                                >
                                    Suivant
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal de confirmation dynamique */}
            <ConfirmPopup
                open={confirmConfig.open}
                title={confirmConfig.title}
                message={confirmConfig.message}
                confirmLabel={confirmConfig.confirmLabel}
                variant={confirmConfig.variant}
                onConfirm={confirmConfig.onConfirm}
                onCancel={closeConfirm}
            />
        </>
    );
}