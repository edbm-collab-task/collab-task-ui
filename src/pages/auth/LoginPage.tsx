import {Link } from "react-router-dom";
import GlobalForms from "@/components/form/GlobalForm";
import type { UserLoginReq } from "@/types/user";
import { authService } from "@/services/auth/auth.service";
import { loginFormFields } from "@/components/user/auth/loginForm";
import Logo from "@/assets/logo.png";
import toast from "react-hot-toast";


export default function LoginPage() {

    const handleLogin = async (data: UserLoginReq) => {
        try {
            await authService.login(data);
            window.location.replace("/admin");
        } catch (error) {
            console.error("Login failed :", error);
            toast.error("Veuillez vérifier vos identifiants.");
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-bg p-6">

            <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">

                <div className="hidden md:flex flex-col items-center justify-center bg-primary text-white p-12">

                    <img src={Logo} alt="Logo" className="w-36 h-36 object-contain mb-6" />

                    <span className="mb-5 h-1 w-16 rounded-full bg-accent" />

                    <h1 className="text-3xl font-bold text-center">
                        Bienvenue
                    </h1>

                    <p className="mt-4 text-secondary max-w-xs leading-relaxed">
                        Connectez-vous à votre espace sécurisé.
                    </p>
                </div>


                <div className="flex items-center justify-center p-10">

                    <div className="w-full max-w-md">

                        <GlobalForms<UserLoginReq>
                            title="Connexion"
                            subtitle="Veuillez entrer vos identifiants"
                            fields={loginFormFields}
                            onSubmit={handleLogin}
                            submitLabel="Se connecter"
                        />

                        <div className="mt-4 text-right">
                            <Link to="/reccuperation-comptes" className="text-sm font-medium text-accent transition hover:text-primary hover:underline">
                                Mot de passe oublié ?
                            </Link>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}