import { useState } from "react";
import { createPortal } from "react-dom";
import { ZoomIn, ZoomOut, Maximize, ExternalLink, X } from "lucide-react";
import { commentService } from "@/services/comment/comment.service";

// Modal de prévisualisation de fichier (image zoomable / PDF dans iframe)
// Utilise createPortal pour s'afficher au-dessus de tout (z-[100])
function FilePreviewModal({
    onClose,
    attachmentPath,
    attachmentName,
    attachmentContentType,
}: {
    onClose: () => void;
    attachmentPath: string;
    attachmentName: string;
    attachmentContentType: string | null;
}) {
    const viewUrl = commentService.getAttachmentUrl(attachmentPath);
    const isPdf = attachmentContentType === "application/pdf";
    const [scale, setScale] = useState(1);
    const [fit, setFit] = useState(true);

    const zoomIn = () => {
        setFit(false);
        setScale((s) => Math.min(5, +(s + 0.25).toFixed(2)));
    };
    const zoomOut = () => {
        setFit(false);
        setScale((s) => Math.max(0.25, +(s - 0.25).toFixed(2)));
    };
    const resetZoom = () => {
        setFit(true);
        setScale(1);
    };

    const toolBtn =
        "rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-primary";

    const modal = (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="flex h-[88vh] w-[92vw] max-w-[1100px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <h3
                        className="truncate pr-3 text-sm font-semibold text-gray-800"
                        title={attachmentName}
                    >
                        {attachmentName}
                    </h3>
                    <div className="flex shrink-0 items-center gap-1">
                        {!isPdf && (
                            <>
                                <button
                                    type="button"
                                    onClick={zoomOut}
                                    className={toolBtn}
                                    title="Zoom arrière"
                                >
                                    <ZoomOut size={16} />
                                </button>
                                <span className="w-12 text-center text-xs font-medium text-gray-500">
                                    {fit ? "Auto" : `${Math.round(scale * 100)}%`}
                                </span>
                                <button
                                    type="button"
                                    onClick={zoomIn}
                                    className={toolBtn}
                                    title="Zoom avant"
                                >
                                    <ZoomIn size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={resetZoom}
                                    className={toolBtn}
                                    title="Ajuster à l'écran"
                                >
                                    <Maximize size={16} />
                                </button>
                            </>
                        )}
                        <a
                            href={viewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={toolBtn}
                            title="Ouvrir dans un nouvel onglet"
                        >
                            <ExternalLink size={16} />
                        </a>
                        <button
                            type="button"
                            onClick={onClose}
                            className={toolBtn}
                            title="Fermer"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex flex-1 items-center justify-center overflow-auto bg-slate-100 p-4">
                    {isPdf ? (
                        <iframe
                            src={viewUrl}
                            className="h-full w-full rounded-lg border-none bg-white"
                            title={attachmentName}
                        />
                    ) : (
                        <img
                            src={viewUrl}
                            alt={attachmentName}
                            onDoubleClick={resetZoom}
                            className="select-none"
                            style={{
                                maxWidth: fit ? "100%" : "none",
                                maxHeight: fit ? "100%" : "none",
                                transform: `scale(${fit ? 1 : scale})`,
                                transition: "transform 0.15s ease-out",
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}

export default FilePreviewModal;
