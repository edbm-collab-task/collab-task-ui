import { useEffect, useState } from "react";
import GlobalForms from "@/components/form/GlobalForm";
import { recoveryFormFields } from "@/components/user/auth/recoveryForm";
import Logo from "@/assets/logo.png";

import type { RecoverPasswordFormUI } from "@/types/user";
import { authService } from "@/services/auth/auth.service";
import toast from "react-hot-toast";


export default function RecoveryPage() {
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        authService.recoveryMe()
            .then(res => setEmail(res.email))
            .catch(() => window.location.replace("/"));
    }, []);


    const handleRecovery = async (data: RecoverPasswordFormUI) => {

        if (!email) return;

        if (data.password !== data.confirmPassword) {
            toast.error("Les deux mots de passe ne correspondent pas");
            return;
        }

        try {
            await authService.recovery(email, data);
            window.location.replace("/");
            setTimeout(() => toast.success("Mot de passe réinitialisé avec succès"));
        } catch (error) {
            console.error(error);
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(message || "Impossible de modifier le mot de passe");
        }

    };


    if (!email) {
        return <div className="min-h-screen flex items-center justify-center bg-bg p-6">
            <span className="text-sm text-gray-500">
                Chargement...
            </span>
        </div>;
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-bg p-6">

            <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2 md:gap-10 items-center">

                <div className="hidden md:flex flex-col items-center justify-center rounded-3xl bg-primary p-10 text-center shadow-lg md:min-h-[520px]">

                    <img src={Logo} alt="Collab Task" className="mb-8 h-32 w-32 object-contain" />

                    <span className="mb-5 h-1 w-16 rounded-full bg-accent" />

                    <h1 className="text-3xl font-bold text-white">
                        Réinitialiser votre mot de passe
                    </h1>

                    <p className="mt-4 max-w-sm text-secondary leading-relaxed">
                        Choisissez un nouveau mot de passe sécurisé afin de protéger votre compte.
                    </p>

                </div>

                <div className="flex items-center justify-center p-2">

                    <div className="w-full max-w-md">

                        <GlobalForms<RecoverPasswordFormUI>
                            title="Nouveau mot de passe"
                            subtitle={`Compte : ${email}`}
                            fields={recoveryFormFields}
                            onSubmit={handleRecovery}
                            submitLabel="Modifier le mot de passe"
                        />

                    </div>

                </div>

            </div>

        </div>
    );
}