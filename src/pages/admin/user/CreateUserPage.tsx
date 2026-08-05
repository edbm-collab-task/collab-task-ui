import { useNavigate } from "react-router-dom";

import GlobalForms from "@/components/form/GlobalForm";
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
        <div className="mx-auto mt-10">

            <GlobalForms<RegisterForm>
                title="Créer un utilisateur"
                fields={userFormFields}
                onSubmit={handleRegister}
                submitLabel="Créer"
            />

        </div>
    );
}