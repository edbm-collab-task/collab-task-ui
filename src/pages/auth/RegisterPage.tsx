import GlobalForms from "@/components/form/GlobalForm";
import { userFormFields } from "@/components/user/userForm";
import type { RegisterForm } from "@/types/user";
import { authService } from "@/services/auth/auth.service";

export default function RegisterPage() {

    const handleRegister = async (data: RegisterForm) => {

        try {

            const { confirmPassword, ...user } = data;

            const createdUser = await authService.register(user);

            console.log("User created :", createdUser);

            window.location.replace("/");

        } catch (error) {

            console.error("Register failed :", error);

        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">

            <GlobalForms<RegisterForm>
                title="Créer un utilisateur"
                subtitle="Remplissez les informations ci-dessous"
                fields={userFormFields}
                onSubmit={handleRegister}
                submitLabel="Créer"
            />

        </div>
    );
}