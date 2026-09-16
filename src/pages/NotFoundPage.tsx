import { Link } from "react-router-dom";
import { Home, SearchX, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/constant/routes";

export default function NotFoundPage() {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-priamry to-accent px-6">

            <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary blur-3xl" />
            <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent blur-3xl" />

            <div className="relative w-full max-w-lg rounded-3xl border border-none bg-white/5 p-10 text-center shadow-2xl backdrop-blur-xl">

                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10 ring-1 ring-primary/30">
                    <SearchX size={42} className="text-bg" />
                </div>

                <h1 className="text-7xl font-black text-white">
                    404
                </h1>

                <h2 className="mt-3 text-2xl font-bold text-white">
                    Page introuvable
                </h2>

                <p className="mt-3 text-primary">
                    Cette page n'existe pas ou a été déplacée.
                </p>

                <div className="mt-7 flex justify-center gap-3">

                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
                    >
                        <ArrowLeft size={18} />
                        Retour
                    </button>
                    <Link
                        to={ROUTES.HOME}
                        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-accent"
                    >
                        <Home size={18} />
                        Accueil
                    </Link>


                </div>

            </div>

        </div>
    );
}