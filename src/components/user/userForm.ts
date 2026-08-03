import type { FormField } from "@/components/Form/form";
import type { RegisterForm } from "@/types/user";
import { Gender } from "@/enum/gender.enum";


export const userFormFields: FormField<RegisterForm>[] = [

    {
        name: "firstname",
        label: "Nom",
        type: "text",
        placeholder: "Entrer votre nom...",

        validation: {
            required: "Nom est requis",

            minLength: {
                value: 2,
                message: "Nom doit contenir au moins 2 caractères"
            },

            maxLength: {
                value: 50,
                message: "Nom doit contenir au maximum 50 caractères"
            }
        }
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
                message: "Prénom doit contenir au moins 2 caractères"
            },

            maxLength: {
                value: 50,
                message: "Prénom doit contenir au maximum 50 caractères"
            }
        }
    },


    {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "example@gmail.com",

        validation: {
            required: "Email is required",

            pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email format"
            }
        }
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
                message: "Numéro de téléphone invalide"
            }
        }
    },


    {
        name: "password",
        label: "Mot de passe",
        type: "password",
        placeholder: "********",

        validation: {
            required: "Le mot de passe est requis",

            minLength: {
                value: 8,
                message: "Le mot de passe doit contenir au moins 8 caractères"
            }
        }
    },

    {
        name: "confirmPassword",
        label: "Confirmer le mot de passe",
        type: "password",
        placeholder: "********",

        matchField: "password",

        validation: {
            required: "Veuillez confirmer votre mot de passe"
        }
    },
    {
        name: "gender",
        label: "Genre",
        type: "select",

        options: [
            {
                label: "Homme",
                value: Gender.MALE
            },
            {
                label: "Femme",
                value: Gender.FEMALE
            }
        ],

        validation: {
            required: "Le genre est requis"
        }
    }

];