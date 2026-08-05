import { useNavigate } from "react-router-dom";

import GlobalForm from "@/components/Form/GlobalForm";
import { userFormFields } from "@/components/user/UserForm";
import type { RegisterForm } from "@/types/user";
import { authService } from "@/services/auth/auth.service";

export default function CreateUserPage() {

    const navigate = useNavigate();

    const handleRegister = async (data: RegisterForm) => {

        try {

            const { confirmPassword, ...user } = data;

            const createdUser = await authService.register(user);

            console.log("User created :", createdUser);

            navigate("/");

        } catch (error) {

            console.error("Register failed :", error);

        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">

            <GlobalForm<RegisterForm>
                title="Créer un utilisateur"
                subtitle="Remplissez les informations ci-dessous"
                fields={userFormFields}
                onSubmit={handleRegister}
                submitLabel="Créer"
            />

        </div>
    );
}