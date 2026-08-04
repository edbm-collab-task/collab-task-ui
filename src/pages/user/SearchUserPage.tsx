import { useNavigate } from "react-router-dom";

import GlobalForm from "@/components/Form/GlobalForm";
import { userEmailFormFields } from "@/components/auth/userEmailForm";

import type { Email } from "@/types/email";

import { authService } from "@/services/auth/auth.service";

import Logo from "@/assets/logo.png";

export default function SearchUserPage() {

    const navigate = useNavigate();

    const handleSearchAccount = async (data: Email) => {

        try {
            await authService.sendVerificationCode(data);
            navigate("/verification");

        } catch (error) {

            console.error("Account not found :", error);
            navigate("/login");

        }

    };

    return (

        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 p-6">

            <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">

                {/* Partie gauche */}

                <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 to-indigo-900 text-white p-12">

                    <img
                        src={Logo}
                        alt="Collab Task"
                        className="w-36 h-36 object-contain mb-8"
                    />

                    <h1 className="text-3xl font-bold text-center">
                        Retrouver votre compte
                    </h1>

                    <p className="mt-5 text-center text-blue-100 leading-7 max-w-sm">
                        Saisissez l'adresse e-mail associée à votre compte
                        Collab Task afin de vérifier son existence avant de
                        poursuivre la récupération de votre mot de passe.
                    </p>

                </div>

                {/* Partie droite */}

                <div className="flex items-center justify-center p-10">

                    <div className="w-full max-w-md">

                        <GlobalForm<Email>

                            title="Recherche du compte"

                            subtitle="Entrez votre adresse e-mail"

                            fields={userEmailFormFields}

                            onSubmit={handleSearchAccount}

                            submitLabel="Continuer"

                        />

                    </div>

                </div>

            </div>

        </div>

    );
}