import { useCallback, useEffect, useRef, useState } from "react";
import { X, Paperclip, Eye, Download, Trash2, FileText, Image as ImageIcon, File as FileIcon } from "lucide-react";
import toast from "react-hot-toast";
import type { TaskRes } from "@/types/task";
import type { TaskAttachment } from "@/types/attachment";
import { attachmentService } from "@/services/attachment/attachment.service";
import FilePreviewModal from "./FilePreviewModal";
import { ConfirmPopup } from "../common/ConfirmPopup";
import Allow from "@/components/common/Allow";
import { PERM } from "@/constants/permissions";
import { ACT } from "@/constants/actions";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { formatFileSizeFr } from "@/utils/format";

interface Props {
    open: boolean;
    task: TaskRes | null;
    onClose: () => void;
    /** Remonte le nombre de pièces jointes au KanbanBoard (compteur de la carte). */
    onCountChange?: (count: number) => void;
}

interface PreviewState {
    url: string;
    name: string;
    contentType: string;
}

interface ConfirmState {
    open: boolean;
    attachmentId: number | null;
    name: string;
}

// Mêmes types de fichiers acceptés que l'onglet « Pièces jointes » de TaskModal.
const ACCEPTED_FILES = ".pdf,.doc,.docx,.xls,.xlsx,.csv";

// Seuls les images et les PDF peuvent être affichés par FilePreviewModal.
const canPreview = (contentType: string) =>
    contentType.startsWith("image/") || contentType === "application/pdf";

function FileTypeIcon({ contentType }: { contentType: string }) {
    if (contentType.startsWith("image/")) return <ImageIcon size={18} />;
    if (contentType === "application/pdf") return <FileText size={18} />;
    return <FileIcon size={18} />;
}

/**
 * Fenêtre des pièces jointes d'une tâche (ouverte depuis l'icône 📎 de la carte).
 *
 * - Liste les pièces jointes avec Voir (images/PDF) et Télécharger ;
 * - Permet d'ajouter (INSERT) et de supprimer (DELETE) des fichiers, avec les
 *   mêmes permissions que l'onglet « Pièces jointes » de TaskModal.
 */
export default function TaskAttachmentsPanel({ open, task, onClose, onCountChange }: Props) {
    const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [preview, setPreview] = useState<PreviewState | null>(null);
    const [confirm, setConfirm] = useState<ConfirmState>({ open: false, attachmentId: null, name: "" });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Ref pour ne pas relancer le chargement si le parent recrée sa fonction.
    const onCountChangeRef = useRef(onCountChange);
    useEffect(() => {
        onCountChangeRef.current = onCountChange;
    }, [onCountChange]);

    const taskId = task?.taskId;

    const applyList = useCallback((data: TaskAttachment[]) => {
        setAttachments(data);
        onCountChangeRef.current?.(data.length);
    }, []);

    // Rechargement manuel après ajout / suppression
    const reload = useCallback(async (id: number) => {
        try {
            applyList(await attachmentService.getAll(id));
        } catch {
            toast.error("Impossible de recharger les pièces jointes.");
        }
    }, [applyList]);

    // Chargement à chaque ouverture / changement de tâche
    useEffect(() => {
        if (!open || taskId === undefined) return;
        let cancelled = false;
        setLoading(true);
        attachmentService
            .getAll(taskId)
            .then((data) => {
                if (!cancelled) applyList(data);
            })
            .catch(() => {
                if (!cancelled) {
                    setAttachments([]);
                    toast.error("Impossible de charger les pièces jointes.");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [open, taskId, applyList]);

    const closePreview = () => {
        if (preview) URL.revokeObjectURL(preview.url);
        setPreview(null);
    };

    // Echap ferme d'abord l'aperçu / la confirmation, puis le panneau
    useEscapeKey(onClose, open && !preview && !confirm.open);

    // Le fichier est récupéré avec axios (cookies + Bearer) puis affiché via une
    // URL temporaire : fonctionne même si le backend renvoie
    // `Content-Disposition: attachment`.
    const fetchBlob = async (att: TaskAttachment) => {
        const blob = await attachmentService.getBlob(att.id);
        return new Blob([blob], { type: att.contentType || blob.type });
    };

    const handleView = async (att: TaskAttachment) => {
        setBusyId(att.id);
        try {
            const blob = await fetchBlob(att);
            setPreview({
                url: URL.createObjectURL(blob),
                name: att.originalName,
                contentType: att.contentType,
            });
        } catch {
            toast.error("Impossible d'ouvrir ce fichier.");
        } finally {
            setBusyId(null);
        }
    };

    const handleDownload = async (att: TaskAttachment) => {
        setBusyId(att.id);
        try {
            const blob = await fetchBlob(att);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = att.originalName; // nom d'origine du fichier
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch {
            toast.error("Impossible de télécharger ce fichier.");
        } finally {
            setBusyId(null);
        }
    };

    // Ajout d'un ou plusieurs fichiers (envoyés l'un après l'autre)
    const handleFilesSelected = async (files: FileList | null) => {
        if (!files || files.length === 0 || taskId === undefined) return;
        setUploading(true);
        let uploaded = 0;
        try {
            for (const file of Array.from(files)) {
                try {
                    await attachmentService.upload(taskId, file);
                    uploaded += 1;
                } catch {
                    // erreur déjà signalée par l'intercepteur axios (toast global)
                }
            }
            if (uploaded > 0) {
                await reload(taskId);
                toast.success(uploaded > 1 ? `${uploaded} fichiers ajoutés` : "Fichier ajouté");
            }
        } finally {
            setUploading(false);
            // permet de re-sélectionner le même fichier ensuite
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const askDelete = (att: TaskAttachment) => {
        setConfirm({ open: true, attachmentId: att.id, name: att.originalName });
    };

    const closeConfirm = () => setConfirm((prev) => ({ ...prev, open: false }));

    const confirmDelete = async () => {
        const id = confirm.attachmentId;
        closeConfirm();
        if (id === null || taskId === undefined) return;
        try {
            await attachmentService.delete(id);
            await reload(taskId);
            toast.success("Pièce jointe supprimée");
        } catch {
            // erreur déjà signalée par l'intercepteur axios
        }
    };

    if (!open || !task) return null;

    const iconBtn =
        "rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40";

    return (
        <>
            <div className="fixed inset-0 z-50 bg-slate-900/30" onClick={onClose} />

            <div className="fixed left-1/2 top-1/2 z-50 flex h-[min(80vh,640px)] w-[min(560px,92vw)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-white shadow-2xl">
                {/* En-tête */}
                <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
                    <div className="min-w-0">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                            <Paperclip size={15} className="text-accent" />
                            Pièces jointes ({attachments.length})
                        </h3>
                        <p className="mt-0.5 truncate text-xs text-gray-500" title={task.title}>
                            {task.title}
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className={iconBtn} title="Fermer">
                        <X size={18} />
                    </button>
                </div>

                {/* Liste */}
                <div className="flex-1 space-y-2 overflow-y-auto p-4">
                    {loading && <p className="py-8 text-center text-sm text-gray-400">Chargement…</p>}

                    {!loading && attachments.length === 0 && (
                        <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
                            <Paperclip size={28} />
                            <p className="text-sm">Aucune pièce jointe pour cette tâche</p>
                        </div>
                    )}

                    {!loading &&
                        attachments.map((att) => {
                            const busy = busyId === att.id;
                            return (
                                <div
                                    key={att.id}
                                    className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5 ring-1 ring-gray-100"
                                >
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <FileTypeIcon contentType={att.contentType} />
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-gray-800" title={att.originalName}>
                                            {att.originalName}
                                        </p>
                                        <p className="truncate text-xs text-gray-500">
                                            {formatFileSizeFr(att.size)} · {att.uploadedByName} ·{" "}
                                            {new Date(att.uploadedAt).toLocaleDateString("fr-FR")}
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1">
                                        {canPreview(att.contentType) && (
                                            <button
                                                type="button"
                                                onClick={() => handleView(att)}
                                                disabled={busy}
                                                className={iconBtn}
                                                title="Voir"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        )}
                                        <Allow perm={PERM.MANAGE_ATTACHMENTS} action={ACT.DOWNLOAD}>
                                            <button
                                                type="button"
                                                onClick={() => handleDownload(att)}
                                                disabled={busy}
                                                className={iconBtn}
                                                title="Télécharger"
                                            >
                                                <Download size={16} />
                                            </button>
                                        </Allow>
                                        <Allow perm={PERM.MANAGE_ATTACHMENTS} action={ACT.DELETE}>
                                            <button
                                                type="button"
                                                onClick={() => askDelete(att)}
                                                disabled={busy}
                                                className={`${iconBtn} hover:!text-accent`}
                                                title="Supprimer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </Allow>
                                    </div>
                                </div>
                            );
                        })}
                </div>

                {/* Pied : ajout de fichiers */}
                <Allow perm={PERM.MANAGE_ATTACHMENTS} action={ACT.INSERT}>
                    <div className="border-t border-gray-100 p-4">
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={ACCEPTED_FILES}
                            className="hidden"
                            onChange={(e) => handleFilesSelected(e.target.files)}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary/30 px-3 py-2.5 text-xs font-medium text-primary transition hover:border-accent hover:text-accent disabled:opacity-50"
                        >
                            <Paperclip size={13} />
                            {uploading ? "Envoi en cours…" : "Ajouter un fichier"}
                        </button>
                    </div>
                </Allow>
            </div>

            {preview && (
                <FilePreviewModal
                    onClose={closePreview}
                    src={preview.url}
                    attachmentName={preview.name}
                    attachmentContentType={preview.contentType}
                />
            )}

            {/* Rendu en dernier pour passer au-dessus du panneau (même z-50) */}
            <ConfirmPopup
                open={confirm.open}
                title="Supprimer la pièce jointe"
                message={`Voulez-vous vraiment supprimer « ${confirm.name} » ?`}
                confirmLabel="Supprimer"
                variant="danger"
                onConfirm={confirmDelete}
                onCancel={closeConfirm}
            />
        </>
    );
}
