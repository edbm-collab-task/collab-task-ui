import { useNavigate, Link } from "react-router-dom";

import GlobalForm from "@/components/Form/GlobalForm";
import type { UserLoginReq } from "@/types/user";
import { authService } from "@/services/auth/auth.service";
import { loginFormFields } from "@/components/auth/loginForm";

import Logo from "@/assets/logo.png";


export default function LoginPage() {

    const navigate = useNavigate();

    const handleLogin = async (data: UserLoginReq) => {
        try {
            const user = await authService.login(data);
            console.log("User logged :", user);
            navigate("/admin");
        } catch (error) {
            console.error("Login failed :", error);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-200 p-6">

            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

                <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 to-indigo-900 text-white p-10">
                    <img src={Logo} alt="Logo" className="w-40 h-40 object-contain mb-6 drop-shadow-xl" />

                    <h1 className="text-3xl font-bold text-center">
                        Bienvenue
                    </h1>

                    <p className="mt-4 text-center text-blue-100 max-w-xs">
                        Connectez-vous à votre espace sécurisé.
                    </p>
                </div>


                <div className="flex items-center justify-center p-8 md:p-12">

                    <div className="w-full max-w-md">

                        <GlobalForm<UserLoginReq>
                            title="Connexion"
                            subtitle="Veuillez entrer vos identifiants"
                            fields={loginFormFields}
                            onSubmit={handleLogin}
                            submitLabel="Se connecter"
                        />

                        <div className="mt-4 text-right">
                            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition">
                                Mot de passe oublié ?
                            </Link>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}