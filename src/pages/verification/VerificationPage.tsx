import { useNavigate } from "react-router-dom";

import GlobalForm from "@/components/Form/GlobalForm";
import { codeVerificationFormFields } from "@/components/auth/codeVerification";

import type { CodeVerification } from "@/types/codeVerification";

import { authService } from "@/services/auth/auth.service";

import Logo from "@/assets/logo.png";

export default function VerificationPage() {

    const navigate = useNavigate();

    const handleVerification = async (data: CodeVerification) => {

        try {

            await authService.verification(data);

            navigate("/information-personnelle");

        } catch (error) {

            console.error("Verification failed :", error);

        }

    };

    return (

        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 flex items-center justify-center p-6">

            <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">

                {/* Partie gauche */}

                <div className="hidden bg-gradient-to-br from-blue-700 to-indigo-900 p-12 text-white md:flex md:flex-col md:items-center md:justify-center">

                    <img
                        src={Logo}
                        alt="Collab Task"
                        className="mb-8 h-36 w-36 object-contain"
                    />

                    <h1 className="text-center text-3xl font-bold">
                        Vérification du compte
                    </h1>

                    <p className="mt-4 max-w-sm text-center text-blue-100 leading-7">

                        Nous avons envoyé un code de vérification à votre adresse
                        e-mail.

                        <br /><br />

                        Saisissez ce code afin de confirmer votre identité avant
                        de choisir un nouveau mot de passe.

                    </p>

                </div>

                {/* Partie droite */}

                <div className="flex items-center justify-center p-10">

                    <div className="w-full max-w-md">

                        <GlobalForm<CodeVerification>

                            title="Code de vérification"

                            subtitle="Entrez le code reçu par e-mail"

                            fields={codeVerificationFormFields}

                            onSubmit={handleVerification}

                            submitLabel="Vérifier"

                        />

                    </div>

                </div>

            </div>

        </div>

    );

}