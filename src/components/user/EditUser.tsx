import type { FormField } from "@/components/form/Forms";
import type { DirectionRes } from "@/types/direction";
import type { EditUser } from "@/types/user";
import { Gender } from "@/enum/gender.enum";

export const editUserFormFields = (
    directions: DirectionRes[]
): FormField<EditUser>[] => [

    {
        name: "firstname",
        label: "Nom",
        type: "text",
        placeholder: "Entrer votre nom...",
        validation: {
            required: "Nom est requis",
            minLength: {
                value: 2,
                message: "Nom doit contenir au moins 2 caractères",
            },
            maxLength: {
                value: 50,
                message: "Nom doit contenir au maximum 50 caractères",
            },
        },
    },

    {
        name: "lastname",
        label: "Prénom",
        type: "text",
        placeholder: "Entrer votre prénom...",
        validation: {
            required: "Prénom est requis",
            minLength: {
                value: 2,
                message: "Prénom doit contenir au moins 2 caractères",
            },
            maxLength: {
                value: 50,
                message: "Prénom doit contenir au maximum 50 caractères",
            },
        },
    },

    {
        name: "job",
        label: "Fonction",
        type: "text",
        placeholder: "Entrer votre fonction...",
        validation: {
            required: "La fonction est requise",
        },
    },

    {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "example@gmail.com",
        validation: {
            required: "Email est requis",
            pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Format email invalide",
            },
        },
    },

    {
        name: "number",
        label: "Téléphone",
        type: "text",
        placeholder: "+261 34 00 000 00",
        validation: {
            required: "Le numéro de téléphone est requis",
            pattern: {
                value: /^[0-9+\s-]+$/,
                message: "Numéro de téléphone invalide",
            },
        },
    },

    {
        name: "directionId",
        label: "Direction",
        type: "select",
        placeholder: "Choisir la direction...",
        options: directions.map((direction) => ({
            label: direction.name,
            value: direction.directionId,
        })),
        validation: {
            required: "La direction est requise",
        },
    },

    {
        name: "gender",
        label: "Genre",
        type: "select",
        options: [
            {
                label: "Homme",
                value: Gender.MALE,
            },
            {
                label: "Femme",
                value: Gender.FEMALE,
            },
        ],
        validation: {
            required: "Le genre est requis",
        },
    },
];