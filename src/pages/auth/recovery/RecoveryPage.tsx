import { useEffect, useState } from "react";
import GlobalForms from "@/components/form/GlobalForm";
import { recoveryFormFields } from "@/components/user/auth/recoveryForm";
import Logo from "@/assets/logo.png";

import type { RecoverPasswordFormUI } from "@/types/user";
import { authService } from "@/services/auth/auth.service";


export default function RecoveryPage() {
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        authService.recoveryMe()
            .then(res => setEmail(res.email))
            .catch(() => window.location.replace("/"));
    }, []);


    const handleRecovery = async (data: RecoverPasswordFormUI) => {

        if (!email) return;

        try {
            await authService.recovery(email, data);
            window.location.replace("/");
        } catch (error) {
            console.error(error);
        }

    };


    if (!email) {
        return <div className="min-h-screen flex items-center justify-center">
            Chargement...
        </div>;
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 flex items-center justify-center p-6">

            <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">

                <div className="hidden bg-gradient-to-br from-blue-700 to-indigo-900 p-12 text-white md:flex md:flex-col md:items-center md:justify-center">

                    <img src={Logo} alt="Collab Task" className="mb-8 h-36 w-36 object-contain" />

                    <h1 className="text-center text-3xl font-bold">
                        Réinitialiser votre mot de passe
                    </h1>

                    <p className="mt-4 max-w-sm text-center text-blue-100">
                        Choisissez un nouveau mot de passe sécurisé afin de protéger votre compte.
                    </p>

                </div>

                <div className="flex items-center justify-center p-10">

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