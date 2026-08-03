import { Link } from "react-router-dom";
import { Home, SearchX, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/constant/routes";

export default function NotFoundPage() {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-gray-900 to-blue-950 px-6">

            <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />

            <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-2xl backdrop-blur-xl">

                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 ring-1 ring-blue-400/30">
                    <SearchX size={42} className="text-blue-400" />
                </div>

                <h1 className="text-7xl font-black text-white">
                    404
                </h1>

                <h2 className="mt-3 text-2xl font-bold text-white">
                    Page introuvable
                </h2>

                <p className="mt-3 text-gray-400">
                    Cette page n'existe pas ou a été déplacée.
                </p>

                <div className="mt-7 flex justify-center gap-3">

                    <Link
                        to={ROUTES.HOME}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
                    >
                        <Home size={18} />
                        Accueil
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
                    >
                        <ArrowLeft size={18} />
                        Retour
                    </button>

                </div>

            </div>

        </div>
    );
}