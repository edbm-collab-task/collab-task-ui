import GlobalForms from "@/components/form/GlobalForm";
import type { CreateUser } from "@/types/user";
import { authService } from "@/services/auth/auth.service";
import { useNavigate } from "react-router";
import type { DirectionRes } from "@/types/direction";
import { useState , useEffect } from "react";
import { directionService } from "@/services/direction/direction.service";
import {createUserFormFields } from "@/components/user/createUserForm"

export default function CreateUserPage() {

    const navigate = useNavigate();
    const [directions, setDirections] = useState<DirectionRes[]>([]);

    const handleRegister = async (data:CreateUser) => {

        try {
            const createdUser = await authService.create(data);

            console.log("User created :", createdUser);

            navigate("/admin/users");

            console.log("Navigation exécutée");

        } catch (error) {

            console.error("Register failed :", error);

        }
    };

    useEffect(() => {
    const loadDirections = async () => {
        try {
            const response = await directionService.getAll();
            setDirections(response);
        } catch (error) {
            console.error(error);
        }
    };

    loadDirections();
    }, []);
  
    return (
        <div className="mx-auto mt-10">

            <GlobalForms<CreateUser>
                title="Créer un utilisateur"
                subtitle="Veuiller remplir les informations pour l'utilisateur "
                fields={createUserFormFields(directions)}
                onSubmit={handleRegister}
                submitLabel="Créer"
            />

        </div>
    );
}