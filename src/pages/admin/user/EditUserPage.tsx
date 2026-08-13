import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import GlobalEditForm from "@/components/form/GlobalEditForm";
import { editUserFormFields } from "@/components/user/EditUser";

import { userService } from "@/services/user/user.service";
import { directionService } from "@/services/direction/direction.service";

import type { EditUser } from "@/types/user";
import type { DirectionRes } from "@/types/direction";

export default function EditUserPage() {

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<EditUser | null>(null);
    const [directions, setDirections] = useState<DirectionRes[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadData = async () => {

            if (!id) {
                return;
            }

            try {

                setLoading(true);

                const [userResponse, directionResponse] =
                    await Promise.all([
                        userService.getById(Number(id)),
                        directionService.getAll(),
                    ]);

                const currentDirection = directionResponse.find(
                    (direction) =>
                        direction.name === userResponse.direction
                );

                const editUser: EditUser = {
                    firstname: userResponse.firstname,
                    lastname: userResponse.lastname,
                    job: userResponse.job ?? "",
                    email: userResponse.email,
                    number: userResponse.number ?? "",
                    gender: userResponse.gender,
                    directionId: currentDirection?.directionId,
                };

                setUser(editUser);
                setDirections(directionResponse);

            } catch (error) {

                console.error(
                    "Erreur lors du chargement de l'utilisateur :",
                    error
                );

            } finally {

                setLoading(false);

            }
        };

        loadData();

    }, [id]);

    const handleEditUser = async (data: EditUser) => {

        if (!id || !user) {
            return;
        }

        try {

            const payload: EditUser = {
                firstname: data.firstname,
                lastname: data.lastname,
                job: data.job,
                email: data.email,
                number: data.number,
                gender: data.gender,
            };

            if (
                data.directionId !== undefined &&
                data.directionId !== user.directionId
            ) {

                payload.directionId = data.directionId;

            }

            await userService.updateUser(payload);

            navigate("/admin/users/profile");

        } catch (error) {

            console.error(
                "Erreur lors de la modification de l'utilisateur :",
                error
            );

        }
    };

    if (loading) {

        return (
            <div className="flex min-h-[400px] items-center justify-center">

                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

            </div>
        );

    }

    if (!user) {

        return (
            <div className="flex min-h-[400px] items-center justify-center">

                <p className="text-gray-500">
                    Utilisateur introuvable
                </p>

            </div>
        );

    }

    return (
        <div className="p-6">

            <GlobalEditForm<EditUser>
                title="Modifier vos informations"
                fields={editUserFormFields(directions)}
                initialValues={user}
                onSubmit={handleEditUser}
                submitLabel="Enregistrer"
            />

        </div>
    );
}