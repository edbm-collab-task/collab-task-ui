import type { FormField } from "@/components/form/Forms";
import type { DirectionRes } from "@/types/direction";

export const createUserFormFields = (
    directions: DirectionRes[]
): FormField[] => [
    {
        name: "firstname",
        label: "Nom",
        type: "text",
        placeholder: "Entrer votre nom...",
        validation: {
            required: "Nom est requis"
        }
    },

    {
        name: "lastname",
        label: "Prénom",
        type: "text",
        placeholder: "Entrer votre prénom...",
        validation: {
            required: "Prénom est requis"
        }
    },

    {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "example@gmail.com",
        validation: {
            required: "Email est requis"
        }
    },

    {
        name: "directionId",
        label: "Direction",
        type: "select",
        placeholder: "Choisir la direction...",
        options: directions.map(direction => ({
            label: direction.name,         
            value: direction.directionId    
        })),
        validation: {
            required: "La direction est requise"
        }
    }
];