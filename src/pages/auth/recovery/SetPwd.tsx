import { useEffect, useState } from "react";
import GlobalForms from "@/components/form/GlobalForm";
import { recoveryFormFields } from "@/components/user/auth/recoveryForm";

import type { RecoverPasswordFormUI } from "@/types/user";
import { authService } from "@/services/auth/auth.service";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Check, LockKeyhole, ShieldCheck } from "lucide-react";

export default function ChangePwdPage() {
    const { user } = useAuth();
    const [email, setEmail] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        } else {
            window.location.replace("/");
        }
    }, [user]);

    const handleChangePassword = async (data: RecoverPasswordFormUI) => {
        if (!email) return;

        try {
            await authService.recovery(email, data);
            navigate("/admin/users/profile");
        } catch (error) {
            console.error(error);
        }
    };

    if (!email) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                Chargement...
            </div>
        );
    }

    return (
        <div className="flex h-full w-full items-center justify-center overflow-hidden px-6 py-4">
            <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">

                <div className="hidden flex-col items-center justify-center p-8 md:flex">
                    <img
                        src="/pwd.jpg"
                        alt="Gestion du mot de passe"
                        className="mb-4 h-40 w-40 object-contain"
                    />

                    <h1 className="text-center text-2xl font-bold text-gray-900">
                        Sécurisez votre compte
                    </h1>

                    <p className="mt-2 max-w-sm text-center text-sm leading-5 text-gray-500">
                        Protégez votre compte avec un mot de passe fort et sécurisé.
                    </p>
                </div>

                <div className="flex items-center justify-center p-7 md:p-8">
                    <div className="w-full max-w-md">

                        <div className="mb-6 flex items-center justify-center">
                            <div className="flex items-center">

                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                                        step >= 1
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-500"
                                    }`}
                                >
                                    {step > 1 ? <Check size={15} /> : "1"}
                                </div>

                                <div
                                    className={`h-1 w-12 ${
                                        step >= 2
                                            ? "bg-blue-600"
                                            : "bg-gray-200"
                                    }`}
                                />

                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                                        step >= 2
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-500"
                                    }`}
                                >
                                    2
                                </div>

                            </div>
                        </div>

                        {step === 1 && (
                            <div className="space-y-4">

                                <div className="text-center">

                                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                        <LockKeyhole className="h-6 w-6 text-blue-600" />
                                    </div>

                                    <h2 className="text-xl font-bold text-gray-900">
                                        Gestion du mot de passe
                                    </h2>

                                    <p className="mt-2 text-sm leading-5 text-gray-500">
                                        Vous allez modifier le mot de passe de votre compte.
                                        Choisissez un mot de passe unique et sécurisé.
                                    </p>

                                </div>

                                <div className="rounded-xl border border-gray-200 p-3">

                                    <div className="flex gap-3">
                                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">
                                                Conseils de sécurité
                                            </p>

                                            <ul className="mt-1 space-y-0.5 text-xs text-gray-500">
                                                <li>• Au moins 8 caractères</li>
                                                <li>• Lettres, chiffres et symboles</li>
                                                <li>• Évitez les informations personnelles</li>
                                            </ul>
                                        </div>
                                    </div>

                                </div>

                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="w-full rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Continuer
                                </button>

                            </div>
                        )}

                        {step === 2 && (
                            <div>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    ← Retour
                                </button>


                                <GlobalForms<RecoverPasswordFormUI>
                                    title="Changer le mot de passe"
                                    fields={recoveryFormFields}
                                    onSubmit={handleChangePassword}
                                    submitLabel="Modifier le mot de passe"
                                />

                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}