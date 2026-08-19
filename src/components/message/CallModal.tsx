import { Mic, MicOff, Phone, Video, VideoOff, X } from "lucide-react";
import { useState } from "react";

interface Props {
    name: string;
    type: "audio" | "video";
    onClose: () => void;
}

const CallModal = ({ name, type, onClose }: Props) => {
    const [muted, setMuted] = useState(false);
    const [camera, setCamera] = useState(true);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-gray-900 shadow-2xl">
                <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-blue-500/30">
                    <X size={18} />
                </button>

                <div className="flex min-h-[420px] flex-col items-center justify-center">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-600 text-3xl font-semibold text-white shadow-lg shadow-blue-900/30">
                        {name.split(" ").map((item) => item[0]).join("").slice(0, 2).toUpperCase()}
                    </div>

                    <h2 className="mt-5 text-xl font-semibold text-white">{name}</h2>

                    <p className="mt-1 text-sm text-gray-400">
                        {type === "audio" ? "Appel audio en cours..." : "Appel vidéo en cours..."}
                    </p>
                </div>

                <div className="flex items-center justify-center gap-3 border-t border-white/10 bg-black/20 p-5">
                    <button type="button" onClick={() => setMuted((value) => !value)} title={muted ? "Activer le microphone" : "Couper le microphone"} className={`flex h-12 w-12 items-center justify-center rounded-full text-white transition-colors ${muted ? "bg-blue-600 hover:bg-blue-700" : "bg-white/10 hover:bg-blue-500/30"}`}>
                        {muted ? <MicOff size={19} /> : <Mic size={19} />}
                    </button>

                    {type === "video" && (
                        <button type="button" onClick={() => setCamera((value) => !value)} title={camera ? "Désactiver la caméra" : "Activer la caméra"} className={`flex h-12 w-12 items-center justify-center rounded-full text-white transition-colors ${!camera ? "bg-blue-600 hover:bg-blue-700" : "bg-white/10 hover:bg-blue-500/30"}`}>
                            {camera ? <Video size={19} /> : <VideoOff size={19} />}
                        </button>
                    )}

                    <button type="button" onClick={onClose} title="Terminer l'appel" className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700">
                        <Phone size={19} className="rotate-[135deg]" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CallModal;